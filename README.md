# **SnapClone - Modern Social Media Platform**

> A feature-rich, privacy-first social media application built with React Native and Firebase

[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49.0-black.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

---

## **🎯 Project Overview**

SnapClone is a modern take on ephemeral social media, combining the best features of platforms like Snapchat with enhanced privacy, AI-powered features, and a creator-focused economy. Built with React Native and Expo, it delivers a seamless cross-platform experience with real-time messaging, AR filters, and disappearing content.

### **Key Features**
- 📱 **Ephemeral Messaging**: Photos and videos that disappear after viewing
- 📖 **24-Hour Stories**: Broadcast content to all friends with automatic expiration
- 🎭 **AR Filters**: Face detection and augmented reality effects
- 💬 **Real-time Chat**: Instant messaging with delivery confirmations
- 👥 **Group Messaging**: Multi-user conversations with media sharing
- 🔒 **Privacy-First**: End-to-end encryption and granular privacy controls
- 🎨 **Content Creation**: Advanced editing tools with drawing and text overlays
- 🌐 **Cross-Platform**: Mobile-first with web and desktop expansion planned

---

## **🚀 Tech Stack**

### **Frontend**
- **Framework**: React Native with Expo (Managed Workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: NativeWind (Tailwind CSS) + StyleSheet
- **Forms**: React Hook Form with Yup validation

### **Backend & Services**
- **Backend-as-a-Service**: Firebase
  - **Authentication**: Firebase Auth
  - **Database**: Firestore (NoSQL)
  - **Storage**: Firebase Cloud Storage
  - **Functions**: Firebase Cloud Functions (Node.js 20)
  - **Messaging**: Firebase Cloud Messaging (FCM)

### **Camera & Media**
- **Camera**: Expo Camera
- **AR Filters**: Expo Face Detector
- **Drawing**: React Native SVG + Gesture Handler
- **Media Processing**: Expo Image Manipulator

### **Development Tools**
- **Package Manager**: npm
- **Testing**: Jest + React Native Testing Library
- **Code Quality**: ESLint + Prettier
- **Development**: Expo Go (iOS/Android testing)

---

## **📱 Target Platforms**

- **Primary**: iOS (iPhone 16 Pro optimized)
- **Secondary**: Android
- **Future**: Web application, Desktop (Electron)

---

## **🏗️ Project Architecture**

### **Development Philosophy**
- **AI-First Development**: Modular, well-documented code optimized for AI assistance
- **500-Line File Limit**: Maximum readability and maintainability
- **Separation of Concerns**: Clear responsibility boundaries
- **Type Safety**: Comprehensive TypeScript implementation
- **Performance-First**: 60fps target with optimized rendering

### **Directory Structure**
```
iOSApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Universal components (Button, Input)
│   │   ├── forms/           # Form-specific components
│   │   └── navigation/      # Navigation components
│   ├── screens/             # Screen-level components
│   │   ├── auth/            # Authentication screens
│   │   ├── camera/          # Camera and editing screens
│   │   ├── chat/            # Chat and messaging screens
│   │   ├── stories/         # Stories screens
│   │   └── profile/         # Profile and settings screens
│   ├── store/               # Redux store and state management
│   │   ├── slices/          # Redux Toolkit slices
│   │   └── api/             # RTK Query API definitions
│   ├── services/            # External service integrations
│   │   ├── firebase/        # Firebase service modules
│   │   ├── camera/          # Camera utilities
│   │   └── notifications/   # Push notification services
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions and helpers
│   ├── types/               # TypeScript type definitions
│   └── constants/           # Application-wide constants
├── assets/                  # Static assets (images, fonts, icons)
├── docs/                    # Project documentation
├── __tests__/               # Test files
└── App.tsx                  # Root application component
```

---

## **🎨 Design System**

### **Theme: Dark Minimalism + Glassmorphic Overlays**
- **Primary Colors**: 
  - Snap Yellow: `#FFFC00`
  - Electric Blue: `#0FADFF`
- **Design Approach**: Mobile-first, content-focused interface
- **Visual Style**: Dark backgrounds with subtle glassmorphic effects
- **Typography**: iOS Dynamic Type support with fluid scaling
- **Spacing**: 8pt grid system for consistent layouts

### **Navigation Pattern**
- **Bottom Tabs**: Chat | Camera (Center) | Stories
- **Universal Header**: Profile + Search icons on every screen
- **Gesture Navigation**: Swipe left/right from camera for quick access
- **Context-Aware**: Smart back navigation based on user flow

---

## **🔧 Getting Started**

### **Prerequisites**
- Node.js 18+ (Node.js 20 recommended for Cloud Functions)
- npm or yarn package manager
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Emulator
- Firebase account and project setup

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SnapConnect/iOSApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   ```bash
   # Copy firebase configuration
   cp firebase.config.example.js firebase.config.js
   # Add your Firebase project configuration
   ```

4. **Start development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS Simulator
   npx expo start --ios
   
   # Android Emulator
   npx expo start --android
   
   # Physical device with Expo Go
   # Scan QR code from Expo Dev Tools
   ```

### **Environment Setup**

Create a `.env` file in the project root:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## **📋 Development Phases**

### **Phase 0: Foundation Setup** (3-5 days)
- ✅ Project initialization and Firebase integration
- ✅ Basic navigation structure
- ✅ Authentication system
- ✅ UI component library

### **Phase 1: MVP** (2-3 weeks)
- 🚧 Camera interface and snap capture
- 🚧 Snap editing (text, drawing, stickers)
- 🚧 Friend management system
- 🚧 Real-time messaging
- 🚧 Ephemeral content logic

### **Phase 2: Enhanced Features** (2-3 weeks)
- ⏳ Stories with 24-hour expiration
- ⏳ Group messaging
- ⏳ Basic AR filters (5+ filters)
- ⏳ Advanced editing tools
- ⏳ Performance optimizations

### **Phase 3: Polish & Production** (3-4 weeks)
- ⏳ Advanced AR filters (15+ filters)
- ⏳ Voice and video messaging
- ⏳ End-to-end encryption
- ⏳ Accessibility compliance
- ⏳ App Store preparation

### **Phase 4: Advanced Features** (6-8 weeks)
- ⏳ Snap Map and location features
- ⏳ Creator economy and monetization
- ⏳ AI-powered recommendations
- ⏳ Cross-platform expansion

---

## **🧪 Testing**

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Testing Strategy**
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Service and API integration testing
- **E2E Tests**: Complete user flow testing with Detox
- **Performance Tests**: 60fps target validation

---

## **📝 Code Conventions**

### **File Naming**
- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Files**: `kebab-case.ts` (e.g., `user-profile-screen.tsx`)
- **Hooks**: `use-hook-name.ts` (e.g., `use-auth.ts`)
- **Services**: `service-name.service.ts` (e.g., `auth.service.ts`)

### **Import Organization**
```typescript
// 1. React and React Native
import React from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import { useNavigation } from '@react-navigation/native';

// 3. Internal components
import { Button } from '@/components/common/Button';

// 4. Hooks and services
import { useAuth } from '@/hooks/auth/use-auth';

// 5. Types and constants
import type { User } from '@/types/user';
import { COLORS } from '@/constants/colors';
```

### **Documentation Requirements**
- **File Headers**: Purpose, dependencies, last updated
- **Function Documentation**: JSDoc with parameters, returns, examples
- **Component Documentation**: Props, usage examples, integration notes
- **500-Line Limit**: Maximum file size for maintainability

---

## **🔒 Security & Privacy**

### **Data Protection**
- End-to-end encryption for all messages and snaps
- Secure storage for authentication tokens
- Comprehensive Firebase security rules
- Input validation and sanitization

### **Privacy Features**
- Granular privacy controls
- Automatic content expiration
- Screenshot detection
- Biometric authentication support

---

## **📊 Performance Targets**

- **App Startup**: < 3 seconds
- **Camera Launch**: < 500ms
- **Frame Rate**: 60 FPS maintained
- **Memory Usage**: < 200MB during normal operation
- **Network Efficiency**: < 50MB per hour of typical usage

---

## **🤝 Contributing**

### **Development Workflow**
1. Create feature branch from `main`
2. Follow code conventions and documentation requirements
3. Write tests for new functionality
4. Ensure all tests pass and code quality checks pass
5. Submit pull request with detailed description

### **Quality Checklist**
- [ ] File is under 500 lines
- [ ] All functions have JSDoc documentation
- [ ] TypeScript types are explicit
- [ ] Tests are written and passing
- [ ] Code follows established patterns
- [ ] No console.log statements in production code

---

## **📚 Documentation**

- **[Project Overview](docs/project-overview.md)** - Detailed feature requirements and goals
- **[User Flow](docs/user-flow.md)** - Complete navigation and interaction patterns
- **[Tech Stack](docs/tech-stack.md)** - Comprehensive technology decisions and best practices
- **[Project Rules](docs/project-rules.md)** - Development conventions and AI-first principles
- **[Development Roadmap](docs/development-roadmap.md)** - Complete development timeline and milestones

---

## **🎯 Project Goals**

### **Short-term (6 months)**
- Launch MVP with core Snapchat-like features
- Achieve 10,000+ beta users
- Establish creator beta program
- App Store approval and launch

### **Long-term (2-3 years)**
- 100M+ monthly active users
- Comprehensive creator economy
- Cross-platform market leadership
- Advanced AR/VR integration

---

## **📄 License**

This project is proprietary and confidential. All rights reserved.

---

## **📞 Contact**

**Project Owner**: Sean Stricker  
**Development Team**: AI-Assisted Development with Cursor  
**Project Start**: January 2025

---

**Built with ❤️ using React Native, Firebase, and AI-first development principles** 