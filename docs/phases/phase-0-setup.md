# **Phase 0: Setup & Foundation**

**Version:** 1.0  
**Date:** January 2025  
**Project:** SnapClone Mobile Application  
**Phase Goal:** Establish barebones project foundation with basic navigation and authentication

---

## **Phase Overview**

This phase creates the fundamental project structure with minimal functionality. The result will be a working React Native app with basic navigation between screens and a simple authentication flow. While not fully usable, it provides the foundation for all future development.

### **Success Criteria**
- [ ] Project runs successfully on iPhone 16 Pro via Expo Go
- [ ] Basic navigation between 3 main screens (Auth, Camera, Chat)
- [ ] Simple authentication flow (login/signup forms without full validation)
- [ ] Firebase connection established
- [ ] Basic project structure following AI-first principles

### **Phase Duration**
**Estimated Time:** 3-5 days

---

## **Features & Tasks**

### **Feature 1: Project Infrastructure Setup**
**Purpose:** Establish the basic project structure and development environment

**Tasks:**
1. Initialize Expo React Native project with TypeScript
2. Install and configure core dependencies (React Navigation, Redux Toolkit, NativeWind)
3. Set up Firebase project and basic configuration
4. Create basic folder structure following project-rules.md
5. Configure TypeScript, ESLint, and development tools

**Deliverable:** Working project that builds and runs on device

---

### **Feature 2: Basic Navigation Structure**
**Purpose:** Create the core navigation framework for the app

**Tasks:**
1. Set up React Navigation with Tab Navigator (Chat | Camera | Stories)
2. Create placeholder screens for each main section
3. Implement basic stack navigation for authentication flow
4. Add universal header with placeholder Profile and Search icons
5. Test navigation flow between all screens

**Deliverable:** Functional navigation between main app sections

---

### **Feature 3: Authentication Foundation**
**Purpose:** Establish basic user authentication without full validation

**Tasks:**
1. Create Login and Signup screen components with basic forms
2. Set up Firebase Authentication service integration
3. Implement basic Redux slice for authentication state
4. Create simple form handling (no validation yet)
5. Add navigation between auth screens and main app

**Deliverable:** Basic login/signup flow that connects to Firebase

---

### **Feature 4: Basic UI Component Library**
**Purpose:** Create fundamental UI components following design system

**Tasks:**
1. Create Button component with primary/secondary variants
2. Create Input component for form fields
3. Create basic Screen wrapper component with safe area handling
4. Implement basic dark theme colors from theme-rules.md
5. Set up NativeWind configuration with custom theme tokens

**Deliverable:** Reusable UI components with consistent styling

---

### **Feature 5: Firebase Integration Setup**
**Purpose:** Establish connection to Firebase services

**Tasks:**
1. Configure Firebase project with Authentication and Firestore
2. Set up Firebase configuration files and environment variables
3. Create basic Firebase service modules (auth.service.ts)
4. Test Firebase connection and basic authentication
5. Set up basic Firestore security rules

**Deliverable:** Working Firebase integration with authentication

---

## **File Structure After Phase 0**

```
iOSApp/
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Screen.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── camera/
│   │   │   └── CameraScreen.tsx
│   │   ├── chat/
│   │   │   └── ChatScreen.tsx
│   │   └── stories/
│   │       └── StoriesScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── store/
│   │   ├── index.ts
│   │   └── slices/
│   │       └── auth.slice.ts
│   ├── services/
│   │   └── firebase/
│   │       └── auth.service.ts
│   ├── types/
│   │   ├── navigation.ts
│   │   └── auth.ts
│   └── constants/
│       └── colors.ts
├── firebase.config.js
├── tailwind.config.js
└── package.json
```

---

## **Technical Requirements**

### **Dependencies to Install**
```bash
# Core Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# State Management
npm install @reduxjs/toolkit react-redux

# Styling
npm install nativewind
npm install --save-dev tailwindcss

# Firebase
npm install firebase

# Development Tools
npm install --save-dev @typescript-eslint/eslint-plugin eslint-plugin-react-native
```

### **Configuration Files**
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - NativeWind styling configuration  
- `firebase.config.js` - Firebase project configuration
- `.env` - Environment variables for Firebase keys

---

## **Quality Assurance**

### **Testing Checklist**
- [ ] App builds without errors
- [ ] App runs on iPhone 16 Pro via Expo Go
- [ ] Navigation works between all screens
- [ ] Login/Signup forms accept input
- [ ] Firebase connection established (test with console logs)
- [ ] UI components render with basic styling
- [ ] No TypeScript errors
- [ ] Code follows project-rules.md conventions

### **Performance Targets**
- App launch time: < 3 seconds
- Navigation transitions: < 300ms
- No memory leaks during basic navigation

---

## **Known Limitations**

This phase intentionally has limited functionality:
- No form validation or error handling
- No actual authentication logic (forms don't save data)
- No camera functionality
- No real-time features
- Basic styling only (no glassmorphic effects)
- No offline support
- No push notifications

---

## **Next Phase Preview**

**Phase 1 (MVP)** will build upon this foundation by adding:
- Complete authentication with validation
- Basic camera capture functionality
- Simple messaging between users
- Form validation and error handling
- Enhanced UI with glassmorphic design elements

---

This setup phase provides the essential foundation for rapid development of core features in subsequent phases while maintaining code quality and architectural principles. 