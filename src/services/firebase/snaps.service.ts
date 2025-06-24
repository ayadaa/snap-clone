/**
 * Firebase Firestore Snaps Service
 * Handles snap document management, status updates, and ephemeral logic
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { deleteSnap } from './storage.service';

export interface Snap {
  id: string;
  senderId: string;
  recipientId: string;
  mediaType: 'photo' | 'video';
  downloadURL: string;
  storagePath: string;
  duration: number; // For photos: timer seconds, for videos: length in seconds
  viewed: boolean;
  viewedAt?: Timestamp;
  status: 'sending' | 'sent' | 'delivered' | 'opened' | 'expired';
  createdAt: Timestamp;
  expiresAt: Timestamp;
  hasText?: boolean;
  hasDrawing?: boolean;
}

export interface CreateSnapData {
  recipientId: string;
  mediaType: 'photo' | 'video';
  downloadURL: string;
  storagePath: string;
  duration: number;
  hasText?: boolean;
  hasDrawing?: boolean;
}

/**
 * Create a new snap document in Firestore
 * @param senderId - ID of the user sending the snap
 * @param snapData - Snap data including recipient, media info, etc.
 * @returns Promise with the created snap document
 */
export async function createSnap(
  senderId: string,
  snapData: CreateSnapData
): Promise<Snap> {
  try {
    const now = Timestamp.now();
    const expiresAt = new Timestamp(
      now.seconds + (24 * 60 * 60), // 24 hours from now
      now.nanoseconds
    );

    const snapDoc = {
      senderId,
      recipientId: snapData.recipientId,
      mediaType: snapData.mediaType,
      downloadURL: snapData.downloadURL,
      storagePath: snapData.storagePath,
      duration: snapData.duration,
      viewed: false,
      status: 'sent' as const,
      createdAt: now,
      expiresAt,
      hasText: snapData.hasText || false,
      hasDrawing: snapData.hasDrawing || false
    };

    const docRef = await addDoc(collection(db, 'snaps'), snapDoc);

    return {
      id: docRef.id,
      ...snapDoc
    };
  } catch (error) {
    console.error('Error creating snap:', error);
    throw new Error('Failed to create snap');
  }
}

/**
 * Get snaps received by a user (unviewed)
 * @param userId - ID of the recipient
 * @returns Promise with array of received snaps
 */
export async function getReceivedSnaps(userId: string): Promise<Snap[]> {
  try {
    const q = query(
      collection(db, 'snaps'),
      where('recipientId', '==', userId),
      where('viewed', '==', false),
      where('status', '!=', 'expired'),
      orderBy('status'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Snap));
  } catch (error) {
    console.error('Error getting received snaps:', error);
    throw new Error('Failed to get received snaps');
  }
}

/**
 * Get snaps sent by a user
 * @param userId - ID of the sender
 * @returns Promise with array of sent snaps
 */
export async function getSentSnaps(userId: string): Promise<Snap[]> {
  try {
    const q = query(
      collection(db, 'snaps'),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Snap));
  } catch (error) {
    console.error('Error getting sent snaps:', error);
    throw new Error('Failed to get sent snaps');
  }
}

/**
 * Get a specific snap by ID
 * @param snapId - ID of the snap
 * @returns Promise with snap data or null if not found
 */
export async function getSnap(snapId: string): Promise<Snap | null> {
  try {
    const docRef = doc(db, 'snaps', snapId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Snap;
    }

    return null;
  } catch (error) {
    console.error('Error getting snap:', error);
    throw new Error('Failed to get snap');
  }
}

/**
 * Mark a snap as viewed and update status
 * @param snapId - ID of the snap
 * @param userId - ID of the user viewing (for security)
 * @returns Promise with updated snap
 */
export async function markSnapAsViewed(
  snapId: string,
  userId: string
): Promise<Snap | null> {
  try {
    const snap = await getSnap(snapId);
    
    if (!snap) {
      throw new Error('Snap not found');
    }

    // Security check - only recipient can view
    if (snap.recipientId !== userId) {
      throw new Error('Unauthorized to view this snap');
    }

    // Already viewed
    if (snap.viewed) {
      return snap;
    }

    // Update snap as viewed
    const docRef = doc(db, 'snaps', snapId);
    const updateData = {
      viewed: true,
      viewedAt: serverTimestamp(),
      status: 'opened' as const
    };

    await updateDoc(docRef, updateData);

    return {
      ...snap,
      ...updateData,
      viewedAt: Timestamp.now()
    };
  } catch (error) {
    console.error('Error marking snap as viewed:', error);
    throw new Error('Failed to mark snap as viewed');
  }
}

/**
 * Update snap status (for delivery tracking)
 * @param snapId - ID of the snap
 * @param status - New status
 */
export async function updateSnapStatus(
  snapId: string,
  status: Snap['status']
): Promise<void> {
  try {
    const docRef = doc(db, 'snaps', snapId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error('Error updating snap status:', error);
    throw new Error('Failed to update snap status');
  }
}

/**
 * Delete expired snaps (cleanup function)
 * This would typically be called by a Cloud Function
 * @param userId - Optional user ID to clean up specific user's snaps
 */
export async function cleanupExpiredSnaps(userId?: string): Promise<void> {
  try {
    const now = Timestamp.now();
    let q = query(
      collection(db, 'snaps'),
      where('expiresAt', '<=', now)
    );

    if (userId) {
      q = query(q, where('senderId', '==', userId));
    }

    const querySnapshot = await getDocs(q);
    
    // Delete documents and storage files
    const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
      const snapData = docSnapshot.data() as Snap;
      
      // Delete from storage
      try {
        await deleteSnap(snapData.storagePath);
      } catch (error) {
        console.warn('Failed to delete storage file:', snapData.storagePath);
      }
      
      // Delete document
      await deleteDoc(docSnapshot.ref);
    });

    await Promise.all(deletePromises);
    console.log(`Cleaned up ${querySnapshot.docs.length} expired snaps`);
  } catch (error) {
    console.error('Error cleaning up expired snaps:', error);
    throw new Error('Failed to cleanup expired snaps');
  }
}

/**
 * Delete a specific snap (for immediate cleanup after viewing)
 * @param snapId - ID of the snap to delete
 * @param userId - ID of the user requesting deletion (for security)
 */
export async function deleteSnapImmediately(
  snapId: string,
  userId: string
): Promise<void> {
  try {
    const snap = await getSnap(snapId);
    
    if (!snap) {
      return; // Already deleted
    }

    // Security check - only sender or recipient can delete
    if (snap.senderId !== userId && snap.recipientId !== userId) {
      throw new Error('Unauthorized to delete this snap');
    }

    // Delete from storage
    await deleteSnap(snap.storagePath);
    
    // Delete document
    const docRef = doc(db, 'snaps', snapId);
    await deleteDoc(docRef);
    
    console.log('Snap deleted immediately:', snapId);
  } catch (error) {
    console.error('Error deleting snap immediately:', error);
    throw new Error('Failed to delete snap');
  }
} 