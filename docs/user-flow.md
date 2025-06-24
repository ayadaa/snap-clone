# **User Flow Document: SnapClone**

**Version:** 1.0  
**Date:** January 2025  
**Project:** SnapClone Mobile Application

---

## **Navigation Architecture Overview**

### **Bottom Tab Structure**
- **Chat Tab** (Left)
- **Camera Tab** (Center/Main)
- **Stories Tab** (Right)

### **Universal Top Navigation**
- **Profile Icon** (Top Left) - Accessible from every screen
- **Search Icon** (Top Left, next to Profile) - Accessible from every screen

### **Gesture Navigation**
- **Camera Screen** = Central hub
- **Swipe Left** from Camera → Chat Screen  
- **Swipe Right** from Camera → Stories Screen

---

## **1. Authentication & Onboarding Flow**

### **1.1 New User Registration**
```
Sign Up Screen → Enter Email/Username/Password → Create Account → Camera Screen → Permission Requests
```

**Details:**
- User enters email, unique username, and password
- Real-time username validation against Firestore
- Password requirements: 8+ characters, uppercase, lowercase, number
- Upon successful signup → automatically logged in → redirected to Camera Screen
- **Immediate permission requests:** Camera and Microphone access

### **1.2 Returning User Login**
```
Log In Screen → Enter Username/Email + Password → Camera Screen
```

**Alternative Flow:**
```
Log In Screen → "Forgot Password" → Email Reset → Log In Screen
```

---

## **2. Camera Screen (Central Hub)**

### **2.1 Main Camera Interface**
**Entry Points:**
- Default screen after login
- Bottom tab navigation (center tab)
- Swipe navigation from other screens

**User Actions:**
- **Single tap capture button** → Take photo → Editing Screen
- **Press and hold capture button** → Record video (15s max) → Editing Screen
- **Toggle front/rear camera button**
- **Toggle flash button** (On/Off/Auto)
- **AR Filter carousel** → Select filter → Apply to camera view

**Navigation Options:**
- **Swipe Left** → Chat Screen
- **Swipe Right** → Stories Screen
- **Profile Icon (Top Left)** → Profile Screen
- **Search Icon (Top Left)** → Search Screen

---

## **3. Snap Creation & Editing Flow**

### **3.1 Photo/Video Capture to Send**
```
Camera Screen → Capture → Editing Screen → Send To Screen → Select Recipients → Send
```

**Editing Screen Actions:**
- **Text Tool:** Add text, change colors, drag positioning
- **Drawing Tool:** Free-hand drawing with color palette
- **Stickers:** Add emoji stickers, resize and position
- **Timer (Photos only):** Set view duration (1-10 seconds)
- **Save to Camera Roll** (optional)

**Send To Screen Options:**
- **Individual Friends** (with friend list)
- **Group Chats** (existing groups)
- **"My Story"** option

### **3.2 Alternative: Save Only**
```
Camera Screen → Capture → Editing Screen → Save to Camera Roll → Back to Camera
```

---

## **4. Chat Screen & Messaging Flow**

### **4.1 Accessing Chat Screen**
**Entry Points:**
- **Swipe Left** from Camera Screen
- **Chat Tab** (bottom navigation)

### **4.2 Chat Screen Layout**
**Top Navigation:**
- **Profile Icon** (Top Left) → Profile Screen
- **Search Icon** (Next to Profile) → Search Screen  
- **Add Friends Icon** (Top Right) → Add Friends Screen

**Main Content:**
- **Conversations List:** All individual and group chats
- **Create Group Chat Option**
- **Friend Request Notifications** (if any pending)

### **4.3 Individual Chat Flow**
```
Chat Screen → Select Friend → Individual Chat Conversation
```

**Within Individual Chat:**
- **Send Text Messages**
- **View Received Snaps** → Tap to open → Full-screen view → Auto-disappear
- **Camera Icon in Keyboard** → Quick Snap → Auto-send to current chat
- **Send Snap Button** → Full Camera Interface → Auto-recipient selected

**Navigation Out:**
- **Swipe Left** → Back to Chat Screen
- **Swipe Left Again** → Back to Camera Screen
- **Back Arrow** (Top Left) → Back to Chat Screen

### **4.4 Group Chat Flow**
```
Chat Screen → Select Group OR Create New Group → Group Chat Conversation
```

**Group Creation:**
```
Chat Screen → Create Group → Select 2+ Friends → Name Group → Create
```

**Within Group Chat:**
- **Send Text Messages** (visible to all members)
- **Send Snaps** (viewable once by each member)
- **View Read Receipts** (who has seen messages/snaps)
- **Camera Integration** (same as individual chat)

---

## **5. Stories Screen & Viewing Flow**

### **5.1 Accessing Stories Screen**
**Entry Points:**
- **Swipe Right** from Camera Screen
- **Stories Tab** (bottom navigation)

### **5.2 Stories List View**
**Display:**
- **Friends with Active Stories** (chronological list)
- **Story Preview Thumbnails**
- **Time Indicators** (time remaining in 24h cycle)

**Navigation:**
- **Profile Icon** (Top Left) → Profile Screen
- **Search Icon** (Top Left) → Search Screen

### **5.3 Viewing Individual Stories**
```
Stories Screen → Tap Friend's Story → Story Viewer → Story Navigation
```

**Story Viewer Controls:**
- **Auto-play:** Stories play chronologically
- **Tap to Skip** → Next snap in story
- **Hold to Pause** current snap
- **Swipe Down** → Return to Stories List Screen

**Story Interaction:**
- **Comment/React** → Opens private chat with story owner
- **Reactions sent privately** (not visible to other story viewers)

**Navigation Out:**
- **Swipe Down** → Stories List Screen
- **Swipe Right** (from Stories List) → Camera Screen

---

## **6. Profile Screen Flow**

### **6.1 Accessing Profile Screen**
**Entry Points:**
- **Profile Icon** (Top Left) - Available from every screen

### **6.2 Profile Screen Content**
- **Username Display**
- **SnapCode** (QR code for adding friends)
- **Settings/Options**
- **Log Out Button**

**Navigation Out:**
- **Back to Previous Screen** (context-aware)

---

## **7. Search Screen Flow**

### **7.1 Accessing Search Screen**
**Entry Points:**
- **Search Icon** (Top Left) - Available from every screen

### **7.2 Search Functionality**
- **Search Users by Username**
- **Search Results Display**
- **Add Friend from Search Results**

**Navigation Out:**
- **Back to Previous Screen** (context-aware)

---

## **8. Add Friends & Social Management Flow**

### **8.1 Accessing Add Friends Screen**
**Entry Points:**
- **Add Friends Icon** (Top Right of Chat Screen)
- **Search Results** → Add Friend action

### **8.2 Add Friends Screen Content**
- **Search Bar** (find users by exact username)
- **Incoming Friend Requests Section**
  - **Accept Button** per request
  - **Decline Button** per request
- **Send Friend Request** (from search results)

**Friend Request Flow:**
```
Add Friends Screen → Search Username → Send Friend Request → Pending Status
```

**Incoming Request Flow:**
```
Receive Request → Notification → Add Friends Screen → Accept/Decline
```

---

## **9. Cross-Screen Navigation Patterns**

### **9.1 Universal Navigation Elements**
Every screen includes:
- **Profile Icon** (Top Left) → Profile Screen
- **Search Icon** (Top Left) → Search Screen
- **Bottom Tab Navigation** (Chat | Camera | Stories)

### **9.2 Context-Aware Back Navigation**
- **Within Chats:** Back arrow → Chat Screen
- **Within Stories:** Swipe down → Stories List
- **Within Editing:** Back arrow → Camera Screen
- **Within Profiles/Search:** Back arrow → Previous screen

### **9.3 Quick Actions**
- **Camera access in Chat Keyboard** → Direct send to current conversation
- **Long-press capture** → Video recording with visual progress
- **Swipe gestures** → Fluid navigation between main screens

---

## **10. Notification & Real-Time Flows**

### **10.1 Push Notification Flow**
```
Receive Snap → Push Notification → Tap Notification → Open App → Direct to Chat → View Snap
```

### **10.2 In-App Notification Patterns**
- **Friend Requests:** Badge on Add Friends icon
- **New Snaps:** Visual indicator in Chat list
- **Story Updates:** Updated friend list in Stories screen

---

## **11. Error States & Edge Cases**

### **11.1 Permission Denied**
- **Camera/Microphone denied** → Settings prompt → App functionality explanation

### **11.2 Network Issues**
- **Failed sends** → Retry options
- **Loading states** → Progressive indicators
- **Offline mode** → Cached content availability

### **11.3 Content Expiration**
- **Expired Snaps** → Automatic removal from conversation
- **24-hour Stories** → Automatic cleanup from Stories list

---

This user flow document serves as the definitive guide for navigation patterns, user interactions, and screen relationships throughout the SnapClone application. 