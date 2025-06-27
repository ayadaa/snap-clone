/**
 * Firebase Cloud Storage Service
 * Handles uploading, downloading, and managing snap media files
 */

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTask
} from 'firebase/storage';
import { storage } from '../../config/firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface SnapUploadResult {
  downloadURL: string;
  storagePath: string;
  fileName: string;
}

/**
 * Upload a snap (photo or video) to Firebase Storage
 * @param uri - Local file URI from camera
 * @param userId - ID of the user uploading
 * @param mediaType - 'photo' or 'video'
 * @param onProgress - Optional progress callback
 * @returns Promise with download URL and storage path
 */
export async function uploadSnap(
  uri: string,
  userId: string,
  mediaType: 'photo' | 'video',
  onProgress?: (progress: UploadProgress) => void
): Promise<SnapUploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const extension = mediaType === 'photo' ? 'jpg' : 'mp4';
    const fileName = `snap_${timestamp}.${extension}`;
    const storagePath = `snaps/${userId}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Upload with progress tracking if callback provided
    if (onProgress) {
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, blob);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            onProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error(`Failed to upload ${mediaType}: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                downloadURL,
                storagePath,
                fileName
              });
            } catch (error) {
              reject(new Error('Failed to get download URL'));
            }
          }
        );
      });
    } else {
      // Simple upload without progress
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        downloadURL,
        storagePath,
        fileName
      };
    }
  } catch (error) {
    console.error('Error uploading snap:', error);
    throw new Error(`Failed to upload ${mediaType}`);
  }
}

/**
 * Delete a snap from Firebase Storage
 * @param storagePath - Path to the file in storage
 */
export async function deleteSnap(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    console.log('Snap deleted successfully:', storagePath);
  } catch (error) {
    console.error('Error deleting snap:', error);
    throw new Error('Failed to delete snap');
  }
}

/**
 * Generate a presigned URL for temporary access (if needed for advanced features)
 * @param storagePath - Path to the file in storage
 * @returns Download URL
 */
export async function getSnapURL(storagePath: string): Promise<string> {
  try {
    const storageRef = ref(storage, storagePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting snap URL:', error);
    throw new Error('Failed to get snap URL');
  }
}

/**
 * Upload any image to Firebase Storage and get public URL
 * @param uri - Local file URI
 * @param filename - Custom filename/path for storage
 * @returns Promise with public download URL
 */
export async function uploadImageToStorage(
  uri: string,
  filename: string
): Promise<string> {
  try {
    // Create storage reference
    const storageRef = ref(storage, filename);
    
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Upload the blob
    await uploadBytes(storageRef, blob);
    
    // Get the public download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('Image uploaded successfully:', filename);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image to storage');
  }
} 