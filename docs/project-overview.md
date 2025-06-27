## **Project Requirements Document (PRD): "Snap Factor"**

**Version:** 1.0
**Date:** June 23, 2025
**Project Owner:** Sean Stricker
**Primary Developer:** AI Assistant (Cursor)

### 1. Project Overview

#### 1.1. Introduction
This document outlines the requirements for "Snap Factor," a mobile application that combines social media functionality with AI-powered math learning. The application is built for iOS using React Native and Expo, with a Firebase backend infrastructure.

#### 1.2. Project Goal
The primary goal is to build a functional, real-time multimedia messaging application tailored for K-12 math students. Snap Factor allows users to share ephemeral photos and videos ("Snaps"), post 24-hour "Stories," communicate through direct and group messages, and receive AI-powered math assistance through RAG (Retrieval-Augmented Generation) technology.

#### 1.3. Target Audience
The primary target audience is K-12 students (ages 10-18) who need help with math concepts and want to share their mathematical achievements in a social environment similar to Snapchat.

### 2. Technical Stack & Environment

*   **Frontend Framework:** React Native
*   **Development Environment:** Expo (Managed Workflow)
*   **Development Assistant:** Cursor
*   **Testing Device:** iPhone 16 Pro (via Expo Go)
*   **Development Machine:** Windows PC
*   **Backend-as-a-Service (BaaS):** Firebase
    *   **Authentication:** Firebase Authentication
    *   **Database:** Firestore
    *   **File Storage:** Firebase Cloud Storage
    *   **Push Notifications:** Firebase Cloud Messaging (FCM)

### 3. Core Features & Functional Requirements

This section breaks down the project into key user-facing features. Each feature is detailed with specific functional requirements.

#### 3.1. User Authentication & Profile Management (Firebase Auth)
The user must be able to securely create and access their account.

*   **3.1.1. Sign Up Screen:**
    *   Inputs for Email, Password, and a unique Username.
    *   Username must be checked for uniqueness against the Firestore database in real-time.
    *   Password must be at least 8 characters long and include one uppercase character, lowercase character, and number
    *   Upon successful sign-up, the user is automatically logged in and redirected to the main Camera Screen.
    *   User data (email, username, UID) is stored in a `users` collection in Firestore.

*   **3.1.2. Log In Screen:**
    *   Inputs for Username (or Email) and Password.
    *   "Forgot Password" functionality that uses Firebase's built-in email-based password reset.

*   **3.1.3. User Profile Screen:**
    *   Accessible from the main Camera Screen (e.g., by tapping a profile icon).
    *   Displays the user's username and SnapCode (a unique QR code for adding friends).
    *   Option to Log Out.

#### 3.2. Main Camera Interface (Expo Camera)
The core of the application is the camera. It should be the default screen upon opening the app post-login.

*   **3.2.1. Camera View:**
    *   Full-screen live camera preview.
    *   **Capture Button:**
        *   **Single Tap:** Captures a photo.
        *   **Press and Hold:** Records a video (up to 15 seconds). A visual indicator should show recording progress.
    *   **Camera Controls:**
        *   Button to toggle between front-facing and rear-facing camera.
        *   Button to toggle flash (On/Off/Auto).

*   **3.2.2. Simple AR Filters & Effects (Expo Face Detector):**
    *   A carousel or list of selectable AR filters.
    *   **Initial Filters (MVP):**
        1.  **Face Distortion:** A simple warp effect on the detected face.
        2.  **Image Overlay:** Simple 2D images (e.g., dog ears, heart eyes) that track the user's face.
        3.  **Color Filters:** Basic color overlays (e.g., Sepia, Black & White).
    *   Leverage `expo-camera` and its integration with `expo-face-detector` to identify facial landmarks for placing filters.

#### 3.3. Snap Creation & Editing
After a photo or video is captured, the user is taken to an editing screen.

*   **3.3.1. Editing Tools:**
    *   **Text Tool:** Add text captions. Users can change text color and drag the text box around the screen.
    *   **Drawing Tool:** Free-hand drawing on the Snap. Users can select from a palette of 5-7 basic colors.
    *   **Stickers:** A simple library of emoji stickers that can be added and resized on the Snap.

*   **3.3.2. Snap Configuration:**
    *   **Timer (Photos Only):** A button to set the view duration for a photo Snap, from 1 to 10 seconds.
    *   **Save Button:** An option to save the created Snap to the device's camera roll.

*   **3.3.3. Post-Editing Flow:**
    *   A "Send To" button that proceeds to the Friend Selection screen.

#### 3.4. Friend & Social Graph Management
Users must be able to find and manage their connections.

*   **3.4.1. Add Friends Screen:**
    *   Search bar to find users by their exact username.
    *   Ability to send a friend request to a user from search results.
    *   Display a list of incoming friend requests.
    *   Buttons to "Accept" or "Decline" requests.

*   **3.4.2. Friends List:**
    *   A dedicated screen (e.g., swipe right from Camera) showing all current friends.
    *   This list will be the primary interface for initiating chats and selecting recipients for Snaps.

*   **3.4.3. Data Model (Firestore):**
    *   A `friendships` collection where each document represents a relationship (e.g., `userA_UID`, `userB_UID`, `status: 'pending'/'friends'`).

#### 3.5. Real-Time Snap & Chat Messaging
This feature covers the sending, receiving, and viewing of Snaps and text messages.

*   **3.5.1. Send Flow:**
    *   From the "Send To" screen, the user can select one or more friends.
    *   The user can also select an option to post to "My Story".
    *   Upon sending, the media is uploaded to **Firebase Cloud Storage** in a path like `/snaps/{snap_id}.jpg`.
    *   A corresponding document is created in a `snaps` collection in **Firestore** with metadata: `senderId`, `recipientId`, `storageUrl`, `timerDuration`, `viewed: false`, `timestamp`.

*   **3.5.2. Chat Screen:**
    *   This screen lists all conversations with friends, showing the most recent interaction.
    *   An icon indicates the status of the last Snap/message (e.g., "New Snap," "Delivered," "Opened").

*   **3.5.3. Viewing Snaps (Ephemeral Logic):**
    *   The recipient receives a **Push Notification** (via FCM) about the new Snap.
    *   In the chat view, tapping a "New Snap" message opens the Snap full-screen.
    *   The timer (for photos) or video playback begins immediately.
    *   Once the timer expires or the video finishes, the Snap is hidden, and the user is returned to the chat.
    *   The Snap's status in Firestore is updated to `viewed: true`. The client-side logic should prevent re-opening.
    *   A Cloud Function should be implemented to delete the actual file from Cloud Storage after 24 hours to manage storage costs.

*   **3.5.4. Text Chat:**
    *   Within a conversation view, users can send simple text messages.
    *   Messages are ephemeral: they should be deleted from the user's view after they have been read and the user has left the conversation screen.

#### 3.6. Stories Functionality
A way for users to broadcast Snaps to all their friends for 24 hours.

*   **3.6.1. Posting to a Story:**
    *   When sending a Snap, the user can select "My Story" as a recipient.
    *   The Snap is added to the user's current Story.

*   **3.6.2. Viewing Stories:**
    *   A dedicated Stories Screen (e.g., swipe left from Camera) displays a list of friends who have active stories.
    *   Tapping a friend's name opens their Story. The Snaps in the story play in chronological order.
    *   Users can tap to skip to the next Snap in the Story.

*   **3.6.3. Story Logic:**
    *   Each Snap added to a Story has a 24-hour lifespan from its posting time.
    *   **Data Model (Firestore):** A `stories` collection. Each document could be a user's story (`userId`), containing an array of snap objects (`storageUrl`, `timestamp`).
    *   A Cloud Function will be required to periodically clean up and remove Snaps from stories that are older than 24 hours.

#### 3.7. Group Messaging
Allows for communication with multiple users simultaneously.

*   **3.7.1. Group Creation:**
    *   Users can create a new group by selecting 2 or more friends from their friend list.
    *   Users can name the group.

*   **3.7.2. Group Interaction:**
    *   All members of a group can send text messages and Snaps to the group.
    *   Snaps sent to a group can be opened and replayed once by each member.
    *   The chat will show which members have read a message or viewed a Snap.

### 4. Non-Functional Requirements

*   **4.1. Performance:** The app must be responsive. The camera should open instantly. UI navigation and animations should be smooth (60 FPS).
*   **4.2. Security:** All communication with Firebase must use secure protocols (HTTPS, secure WebSockets). Firestore security rules must be implemented to prevent unauthorized data access (e.g., a user can only read their own chats and friend data).
*   **4.3. Usability:** The user interface should be intuitive and gesture-based, mimicking the established patterns of the original Snapchat app (e.g., swipe navigation between Camera, Chat, and Stories).
*   **4.4. Scalability:** The backend architecture on Firebase should be designed to scale with an increasing number of users without significant re-engineering.

### 5. Phased Development Plan (Suggestion for Cursor)

To manage complexity, the project should be built in phases.

*   **Phase 1: Foundation & Authentication**
    1.  Set up the React Native/Expo project with Firebase.
    2.  Implement the User Authentication flow (Sign Up, Log In, Log Out) using Firebase Auth.
    3.  Create the basic navigation structure (e.g., using React Navigation) for the main screens.

*   **Phase 2: Core Camera & Snap Sending**
    1.  Implement the full-screen Camera interface using `expo-camera`.
    2.  Implement photo and video capture.
    3.  Build the Snap editing screen (Text and Draw tools first).
    4.  Implement the Friend system (Add/Accept friends).
    5.  Build the one-to-one Snap sending/receiving flow with disappearing logic.

*   **Phase 3: Stories & UI Polish**
    1.  Implement the "My Story" functionality (posting and viewing).
    2.  Build the dedicated Stories screen.
    3.  Refine UI/UX, add animations and transitions.

*   **Phase 4: Advanced Features**
    1.  Implement basic AR filters using `expo-face-detector`.
    2.  Implement Group Chat functionality.
    3.  Set up Push Notifications with FCM.

---