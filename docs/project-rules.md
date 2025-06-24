# **Project Rules Document: SnapClone**

**Version:** 1.0  
**Date:** January 2025  
**Project:** SnapClone Mobile Application  
**Development Philosophy:** AI-First, Modular, Scalable Architecture

---

## **AI-First Development Philosophy**

### **Core Principles**
- **Modular Architecture:** Every component, service, and utility should be self-contained and reusable
- **Descriptive Naming:** File names, functions, and variables should be immediately understandable
- **Comprehensive Documentation:** Every file should explain its purpose and every function should have proper documentation
- **500-Line File Limit:** No single file should exceed 500 lines to maintain readability and AI comprehension
- **Separation of Concerns:** Each file should have a single, clear responsibility
- **Consistent Patterns:** Similar functionality should follow identical patterns across the codebase

### **AI Tool Optimization**
- **Clear Context:** Each file should provide sufficient context for AI tools to understand its purpose
- **Explicit Dependencies:** All imports and dependencies should be clearly documented
- **Type Safety:** Use TypeScript throughout with explicit type definitions
- **Consistent Structure:** Follow established patterns for maximum AI predictability

---

## **Directory Structure**

### **Root Level Organization**
```
iOSApp/
├── src/                          # All source code
├── assets/                       # Static assets (images, fonts, icons)
├── docs/                         # Project documentation
├── __tests__/                    # Test files (mirrors src structure)
├── App.tsx                       # Root application component
├── app.json                      # Expo configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # NativeWind configuration
├── firebase.config.js            # Firebase configuration
└── README.md                     # Project setup and overview
```

### **Source Code Structure (`src/`)**
```
src/
├── components/                   # Reusable UI components
│   ├── common/                   # Universal components (Button, Input, etc.)
│   ├── forms/                    # Form-specific components
│   ├── navigation/               # Navigation-related components
│   └── feature-specific/         # Components tied to specific features
├── screens/                      # Screen-level components
│   ├── auth/                     # Authentication screens
│   ├── camera/                   # Camera and editing screens
│   ├── chat/                     # Chat and messaging screens
│   ├── stories/                  # Stories screens
│   └── profile/                  # Profile and settings screens
├── store/                        # Redux store and state management
│   ├── slices/                   # Redux Toolkit slices
│   ├── api/                      # RTK Query API definitions
│   ├── middleware/               # Custom middleware
│   └── index.ts                  # Store configuration
├── services/                     # External service integrations
│   ├── firebase/                 # Firebase service modules
│   ├── camera/                   # Camera service utilities
│   ├── notifications/            # Push notification services
│   └── storage/                  # Local storage services
├── hooks/                        # Custom React hooks
│   ├── auth/                     # Authentication hooks
│   ├── camera/                   # Camera-related hooks
│   ├── data/                     # Data fetching hooks
│   └── ui/                       # UI interaction hooks
├── utils/                        # Utility functions and helpers
│   ├── validation/               # Form validation schemas
│   ├── formatting/               # Data formatting utilities
│   ├── constants/                # Application constants
│   └── helpers/                  # General helper functions
├── types/                        # TypeScript type definitions
│   ├── api.ts                    # API response types
│   ├── navigation.ts             # Navigation parameter types
│   ├── user.ts                   # User-related types
│   └── index.ts                  # Exported type definitions
├── styles/                       # Styling utilities and themes
│   ├── theme.ts                  # Theme configuration
│   ├── glass-effects.ts          # Glassmorphic style utilities
│   └── responsive.ts             # Responsive design utilities
└── constants/                    # Application-wide constants
    ├── colors.ts                 # Color palette
    ├── dimensions.ts             # Screen dimensions and spacing
    ├── routes.ts                 # Navigation route names
    └── config.ts                 # App configuration constants
```

---

## **File Naming Conventions**

### **General Rules**
- Use **kebab-case** for file names: `user-profile-screen.tsx`
- Use **PascalCase** for React components: `UserProfileScreen`
- Use **camelCase** for functions and variables: `getUserProfile`
- Use **SCREAMING_SNAKE_CASE** for constants: `MAX_FILE_SIZE`

### **File Type Conventions**
```
# React Components
ComponentName.tsx              # Main component file
ComponentName.types.ts         # Component-specific types
ComponentName.styles.ts        # Component-specific styles
ComponentName.test.tsx         # Component tests
ComponentName.stories.tsx      # Storybook stories (if used)

# Hooks
use-hook-name.ts              # Custom hooks
use-hook-name.test.ts         # Hook tests

# Services
service-name.service.ts       # Service implementations
service-name.types.ts         # Service-specific types
service-name.test.ts          # Service tests

# Utilities
utility-name.util.ts          # Utility functions
utility-name.test.ts          # Utility tests

# Store
feature-name.slice.ts         # Redux slices
feature-name.api.ts           # RTK Query APIs
feature-name.selectors.ts     # Redux selectors
```

### **Directory Naming**
- Use **kebab-case** for directories: `user-profile/`
- Group related files in feature directories
- Keep directory names descriptive and specific

---

## **Code Organization Rules**

### **File Structure Template**
Every file should follow this structure:

```typescript
/**
 * File: component-name.tsx
 * Purpose: Brief description of what this file does
 * Dependencies: List any special dependencies or requirements
 * Last Updated: Date of last significant change
 */

// === IMPORTS ===
// External libraries (React, third-party)
import React from 'react';
import { View, Text } from 'react-native';

// Internal imports (organized by distance from current file)
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/auth/use-auth';
import { UserProfile } from '@/types/user';

// === TYPES ===
// Component-specific types and interfaces
interface ComponentProps {
  userId: string;
  onUpdate: (user: UserProfile) => void;
}

// === CONSTANTS ===
// Component-specific constants
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

// === MAIN COMPONENT ===
// Component implementation with JSDoc
/**
 * ComponentName - Brief description
 * 
 * @param props - Component properties
 * @param props.userId - The user's unique identifier
 * @param props.onUpdate - Callback function when user is updated
 * @returns JSX.Element
 */
export const ComponentName: React.FC<ComponentProps> = ({ 
  userId, 
  onUpdate 
}) => {
  // Component implementation
};

// === EXPORTS ===
export default ComponentName;
export type { ComponentProps };
```

### **Function Documentation Standards**
```typescript
/**
 * Brief description of what the function does
 * 
 * @param paramName - Description of parameter
 * @param optionalParam - Optional parameter description
 * @returns Description of return value
 * @throws Error description when applicable
 * 
 * @example
 * ```typescript
 * const result = functionName('example', { option: true });
 * console.log(result); // Expected output
 * ```
 */
const functionName = (paramName: string, optionalParam?: Options): ReturnType => {
  // Implementation
};
```

### **Component Documentation Standards**
```typescript
/**
 * ComponentName - Component purpose and usage
 * 
 * This component handles [specific functionality]. It integrates with
 * [services/APIs] and manages [state/data].
 * 
 * @param props - Component properties
 * @param props.requiredProp - Required property description
 * @param props.optionalProp - Optional property description
 * 
 * @example
 * ```tsx
 * <ComponentName 
 *   requiredProp="value"
 *   optionalProp={optionalValue}
 * />
 * ```
 */
```

---

## **Feature-Specific Organization**

### **Authentication Feature**
```
src/screens/auth/
├── login-screen.tsx              # Login screen component
├── signup-screen.tsx             # Signup screen component
├── forgot-password-screen.tsx    # Password reset screen
└── auth-navigation.tsx           # Auth stack navigator

src/hooks/auth/
├── use-auth.ts                   # Main authentication hook
├── use-login.ts                  # Login-specific logic
├── use-signup.ts                 # Signup-specific logic
└── use-password-reset.ts         # Password reset logic

src/services/firebase/
├── auth.service.ts               # Firebase Auth integration
├── user.service.ts               # User data management
└── auth.types.ts                 # Auth-related types
```

### **Camera Feature**
```
src/screens/camera/
├── camera-screen.tsx             # Main camera interface
├── snap-editor-screen.tsx        # Snap editing interface
├── filter-selector.tsx           # AR filter selection
└── send-to-screen.tsx            # Recipient selection

src/hooks/camera/
├── use-camera.ts                 # Camera control hook
├── use-snap-editor.ts            # Editing functionality
├── use-ar-filters.ts             # AR filter management
└── use-media-capture.ts          # Photo/video capture

src/services/camera/
├── camera.service.ts             # Camera hardware interface
├── media-processor.service.ts    # Image/video processing
├── ar-filter.service.ts          # AR filter application
└── camera.types.ts               # Camera-related types
```

### **Chat Feature**
```
src/screens/chat/
├── chat-list-screen.tsx          # Chat list overview
├── individual-chat-screen.tsx    # One-on-one chat
├── group-chat-screen.tsx         # Group chat interface
└── chat-settings-screen.tsx      # Chat configuration

src/hooks/chat/
├── use-chat-list.ts              # Chat list management
├── use-messages.ts               # Message handling
├── use-real-time-chat.ts         # Real-time updates
└── use-typing-indicator.ts       # Typing status

src/services/firebase/
├── chat.service.ts               # Chat data management
├── message.service.ts            # Message CRUD operations
├── real-time.service.ts          # Real-time listeners
└── chat.types.ts                 # Chat-related types
```

---

## **State Management Rules**

### **Redux Store Structure**
```
src/store/
├── index.ts                      # Store configuration
├── root-reducer.ts               # Root reducer combination
├── middleware.ts                 # Custom middleware
└── store.types.ts                # Store type definitions

src/store/slices/
├── auth.slice.ts                 # Authentication state
├── chat.slice.ts                 # Chat state management
├── camera.slice.ts               # Camera state
├── stories.slice.ts              # Stories state
└── ui.slice.ts                   # UI state (modals, etc.)

src/store/api/
├── auth.api.ts                   # Authentication API
├── chat.api.ts                   # Chat API endpoints
├── user.api.ts                   # User management API
└── media.api.ts                  # Media upload/download API
```

### **Slice Organization Pattern**
```typescript
/**
 * File: feature-name.slice.ts
 * Purpose: Redux slice for [feature] state management
 * Dependencies: Redux Toolkit, feature-specific types
 */

// === IMPORTS ===
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureState, FeatureData } from './feature.types';

// === INITIAL STATE ===
const initialState: FeatureState = {
  // State definition
};

// === SLICE DEFINITION ===
const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    // Reducer functions with JSDoc
  },
});

// === EXPORTS ===
export const { actionName } = featureSlice.actions;
export default featureSlice.reducer;
export type { FeatureState };
```

---

## **Testing Organization**

### **Test File Structure**
```
__tests__/
├── components/                   # Component tests
├── screens/                      # Screen tests
├── hooks/                        # Hook tests
├── services/                     # Service tests
├── utils/                        # Utility tests
├── __mocks__/                    # Mock implementations
└── test-utils.tsx                # Testing utilities
```

### **Test Naming Convention**
```
component-name.test.tsx           # Component tests
hook-name.test.ts                 # Hook tests
service-name.test.ts              # Service tests
utility-name.test.ts              # Utility tests
```

### **Test Documentation**
```typescript
/**
 * Test Suite: ComponentName
 * Purpose: Test all functionality of ComponentName component
 * Coverage: Props, interactions, edge cases, accessibility
 */

describe('ComponentName', () => {
  /**
   * Test: Component renders correctly with required props
   * Verifies: Basic rendering, prop handling
   */
  it('should render correctly with required props', () => {
    // Test implementation
  });
});
```

---

## **Import Organization Rules**

### **Import Order**
```typescript
// 1. React and React Native
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party libraries (alphabetical)
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

// 3. Internal components (by distance from current file)
import { Button } from '@/components/common/Button';
import { UserAvatar } from '@/components/common/UserAvatar';

// 4. Hooks (alphabetical)
import { useAuth } from '@/hooks/auth/use-auth';
import { useCamera } from '@/hooks/camera/use-camera';

// 5. Services (alphabetical)
import { authService } from '@/services/firebase/auth.service';
import { cameraService } from '@/services/camera/camera.service';

// 6. Types (alphabetical)
import type { NavigationProp } from '@react-navigation/native';
import type { UserProfile } from '@/types/user';

// 7. Constants and utilities
import { COLORS } from '@/constants/colors';
import { formatDate } from '@/utils/formatting/date.util';
```

### **Path Aliases**
```typescript
// Use consistent path aliases
import { Component } from '@/components/common/Component';
import { useHook } from '@/hooks/use-hook';
import { service } from '@/services/service';
import { CONSTANT } from '@/constants/constant';
import { utility } from '@/utils/utility';
import type { Type } from '@/types/type';
```

---

## **Performance and Optimization Rules**

### **Component Optimization**
- Use `React.memo()` for components that receive stable props
- Use `useCallback()` for functions passed as props
- Use `useMemo()` for expensive calculations
- Implement proper key props for list items
- Avoid inline object/array creation in render methods

### **Bundle Optimization**
- Use lazy loading for screens: `const Screen = lazy(() => import('./Screen'));`
- Import only needed functions from libraries: `import { specific } from 'library';`
- Use proper tree-shaking compatible imports
- Avoid importing entire libraries when only specific functions are needed

### **Memory Management**
- Clean up subscriptions and listeners in `useEffect` cleanup
- Use proper disposal for Firebase listeners
- Implement proper image loading and caching strategies
- Monitor and prevent memory leaks in long-running components

---

## **Security and Privacy Rules**

### **Data Protection**
- Never store sensitive data in plain text
- Use Firebase security rules for all data access
- Implement proper input validation and sanitization
- Use secure storage for tokens and sensitive information

### **Code Security**
- Validate all user inputs before processing
- Use proper error handling to prevent information leakage
- Implement rate limiting for API calls
- Use HTTPS for all network communications

---

## **Documentation Requirements**

### **File-Level Documentation**
Every file must include:
- Purpose statement
- Dependencies list
- Usage examples (where applicable)
- Last updated date

### **Function-Level Documentation**
Every function must include:
- Brief description
- Parameter descriptions
- Return value description
- Usage examples
- Error conditions (if applicable)

### **Component-Level Documentation**
Every component must include:
- Purpose and functionality
- Props documentation
- Usage examples
- Integration requirements

---

## **AI Development Assistance Rules**

### **Context Provision**
- Each file should be self-documenting
- Include sufficient context for AI tools to understand purpose
- Use descriptive variable and function names
- Provide clear examples in documentation

### **Consistency Patterns**
- Follow identical patterns for similar functionality
- Use consistent naming conventions throughout
- Maintain predictable file organization
- Implement standard error handling patterns

### **Modularity Requirements**
- Each file should have a single, clear responsibility
- Components should be reusable and composable
- Services should be stateless and testable
- Utilities should be pure functions when possible

---

## **Quality Assurance Checklist**

Before committing any code, verify:
- [ ] File is under 500 lines
- [ ] All functions have JSDoc documentation
- [ ] File has proper header documentation
- [ ] Imports are organized correctly
- [ ] TypeScript types are explicit
- [ ] Component follows naming conventions
- [ ] Tests are written and passing
- [ ] No console.log statements in production code
- [ ] Proper error handling is implemented
- [ ] Code follows established patterns

---

## **Implementation Priority**

### **Phase 1: Foundation**
1. Set up directory structure
2. Create base components with proper documentation
3. Implement authentication with full documentation
4. Establish Redux store structure

### **Phase 2: Core Features**
1. Camera functionality with modular components
2. Chat system with real-time capabilities
3. User management with proper service layer
4. Media processing with service abstraction

### **Phase 3: Advanced Features**
1. Stories functionality
2. AR filters with service abstraction
3. Push notifications
4. Performance optimizations

### **Phase 4: Polish**
1. Advanced animations
2. Comprehensive testing
3. Performance monitoring
4. Documentation completion

---

This project rules document serves as the definitive guide for maintaining an AI-first, modular, and scalable codebase throughout the SnapClone development process. 