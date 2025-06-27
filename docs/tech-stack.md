# **Tech Stack Document: Snap Factor**

**Version:** 1.0  
**Date:** January 2025  
**Project:** Snap Factor Mobile Application

---

## **Core Technology Stack**

### **📱 Frontend Framework**
- **React Native** with **Expo (Managed Workflow)**
- **Development Platform:** Windows PC
- **Testing Device:** iPhone 16 Pro (via Expo Go)
- **Package Manager:** npm

### **🔥 Backend-as-a-Service**
- **Firebase Suite:**
  - **Authentication:** Firebase Authentication
  - **Database:** Firestore
  - **Storage:** Firebase Cloud Storage
  - **Push Notifications:** Firebase Cloud Messaging
  - **Functions:** Firebase Cloud Functions (Node.js 20)

---

## **Selected Libraries & Tools**

### **🧭 Navigation**
**React Navigation v6**
```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

**Key Features:**
- Bottom tab navigation (Chat | Camera | Stories)
- Stack navigation for screen flows
- Modal presentation for Profile/Story viewer
- Gesture-based navigation support
- Universal header components

### **🗂️ State Management**
**Redux Toolkit + RTK Query**
```bash
npm install @reduxjs/toolkit react-redux
```

**Key Features:**
- Complex state management for chat/friends/snaps
- Built-in caching with RTK Query
- Real-time Firestore integration
- Offline support
- Excellent DevTools

### **🎨 Styling**
**NativeWind + StyleSheet Fallback**
```bash
npm install nativewind
npm install --save-dev tailwindcss
```

**Key Features:**
- Utility-first CSS for rapid development
- Responsive design built-in
- StyleSheet fallback for complex positioning
- Consistent design system
- Performance optimized

### **✏️ Drawing & Text Editing**
**React Native SVG + React Native Gesture Handler**
```bash
npx expo install react-native-svg
npx expo install react-native-gesture-handler
```

**Key Features:**
- Vector-based drawing system
- Precise text positioning
- Gesture-based interactions
- Scalable graphics
- Export capabilities

### **📝 Form Handling**
**React Hook Form**
```bash
npm install react-hook-form @hookform/resolvers yup
```

**Key Features:**
- Minimal re-renders
- Built-in validation
- Async validation support
- TypeScript integration
- Excellent performance

---

## **Additional Required Libraries**

### **📷 Camera & Media**
```bash
npx expo install expo-camera
npx expo install expo-av
npx expo install expo-image-manipulator
npx expo install expo-media-library
```

### **🎭 AR & Face Detection**
```bash
npx expo install expo-face-detector
```

### **🔔 Notifications**
```bash
npx expo install expo-notifications
```

### **🔒 Security & Storage**
```bash
npx expo install expo-secure-store
npx expo install @react-native-async-storage/async-storage
```

### **🔥 Firebase Integration**
```bash
npm install firebase
npx expo install expo-firebase-core
```

---

## **Development Tools**

### **📊 Code Quality**
```bash
npm install --save-dev eslint prettier
npm install --save-dev @typescript-eslint/eslint-plugin
npm install --save-dev eslint-plugin-react-native
```

### **🧪 Testing**
```bash
npm install --save-dev jest @testing-library/react-native
npm install --save-dev @testing-library/jest-native
```

### **📱 Development**
```bash
npm install --save-dev react-native-flipper
```

---

## **Project Structure**

```
iOSApp/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   ├── forms/            # Form components
│   │   └── navigation/       # Navigation components
│   ├── screens/
│   │   ├── auth/             # Authentication screens
│   │   ├── camera/           # Camera and editing screens
│   │   ├── chat/             # Chat and messaging screens
│   │   ├── stories/          # Stories screens
│   │   └── profile/          # Profile screens
│   ├── store/
│   │   ├── slices/           # Redux slices
│   │   ├── api/              # RTK Query API
│   │   └── index.ts          # Store configuration
│   ├── services/
│   │   ├── firebase/         # Firebase configuration
│   │   ├── camera/           # Camera utilities
│   │   └── notifications/    # Push notification setup
│   ├── utils/
│   │   ├── validation/       # Form validation schemas
│   │   ├── helpers/          # Utility functions
│   │   └── constants/        # App constants
│   ├── hooks/
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useCamera.ts      # Camera hook
│   │   └── useFirestore.ts   # Firestore hook
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
├── docs/
│   ├── project-overview.md
│   ├── user-flow.md
│   └── tech-stack.md
├── App.tsx
├── app.json
├── tailwind.config.js
├── firebase.config.js
└── package.json
```

---

## **Implementation Phases**

### **Phase 1: Foundation Setup**
1. **Project Setup**
   - Initialize Expo project
   - Install core dependencies
   - Configure Firebase
   - Set up Redux store

2. **Navigation Structure**
   - Implement React Navigation
   - Create bottom tabs
   - Set up stack navigators
   - Add universal headers

3. **Authentication**
   - Sign up/Login screens with React Hook Form
   - Firebase Auth integration
   - User profile management

### **Phase 2: Core Features**
1. **Camera Interface**
   - Expo Camera integration
   - Capture photo/video functionality
   - Basic UI with NativeWind

2. **Snap Editing**
   - Drawing tools with React Native SVG
   - Text editing and positioning
   - Sticker placement

3. **Chat System**
   - Chat list screen
   - Individual chat functionality
   - Real-time messaging with RTK Query

### **Phase 3: Advanced Features**
1. **Stories**
   - Story creation and viewing
   - 24-hour expiration logic
   - Story navigation

2. **Friends System**
   - Friend requests
   - Search functionality
   - Social graph management

3. **Push Notifications**
   - Notification setup
   - Real-time alerts
   - Deep linking

### **Phase 4: Polish & Optimization**
1. **Performance Optimization**
2. **UI/UX Refinements**
3. **Testing & Bug Fixes**
4. **Advanced AR Filters**

---

## **Key Integration Points**

### **Firebase + Redux RTK Query**
```javascript
// Example API slice for Firestore integration
const firestoreApi = createApi({
  reducerPath: 'firestoreApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['User', 'Chat', 'Snap', 'Story'],
  endpoints: (builder) => ({
    getChats: builder.query({
      queryFn: async () => {
        const chats = await getDocs(collection(db, 'chats'));
        return { data: chats.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
      },
      providesTags: ['Chat']
    }),
  })
});
```

### **NativeWind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        snapYellow: '#FFFC00',
        snapBlue: '#0FADFF',
      }
    },
  },
  plugins: [],
}
```

### **React Navigation + Redux**
```javascript
// Navigation with Redux state
const AppNavigator = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};
```

---

## **Performance Considerations**

### **React Native Optimization**
- Use `useMemo` and `useCallback` for expensive operations
- Implement FlatList for large lists
- Optimize image loading with proper sizing
- Use Flipper for performance monitoring

### **Firebase Optimization**
- Implement proper Firestore indexing
- Use batch operations for multiple writes
- Implement offline persistence
- Optimize Cloud Storage usage

### **State Management**
- Structure Redux state for optimal updates
- Use RTK Query caching effectively
- Implement proper loading states
- Avoid unnecessary re-renders

---

## **Security Best Practices**

### **Firebase Security**
- Implement proper Firestore security rules
- Use Firebase Authentication for all protected routes
- Validate all user inputs
- Implement rate limiting for API calls

### **Mobile Security**
- Use Expo SecureStore for sensitive data
- Implement proper session management
- Validate all user-generated content
- Use HTTPS for all communications

---

## **Deployment Strategy**

### **Development**
- Use Expo Go for testing
- Implement proper environment variables
- Set up Firebase emulators for local testing

### **Production**
- Build standalone apps with EAS Build
- Configure app store deployment
- Set up proper Firebase project
- Implement analytics and crash reporting

---

## **Best Practices & Conventions**

### **🧭 React Navigation v6**

#### **✅ Best Practices**
```javascript
// 1. Use TypeScript for navigation params
export type RootStackParamList = {
  Camera: undefined;
  Chat: { chatId?: string };
  Profile: { userId: string };
  StoryViewer: { storyId: string; userIds: string[] };
};

// 2. Create reusable navigation hooks
export const useAppNavigation = () => {
  return useNavigation<NavigationProp<RootStackParamList>>();
};

// 3. Centralize screen options
const screenOptions = {
  headerShown: false,
  gestureEnabled: true,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

// 4. Use proper deep linking
const linking = {
  prefixes: ['snapfactor://'],
  config: {
    screens: {
      Chat: 'chat/:chatId',
      Profile: 'profile/:userId',
    },
  },
};
```

#### **⚠️ Common Pitfalls & Limitations**
- **Memory Leaks:** Always remove navigation listeners in cleanup
- **Gesture Conflicts:** Custom swipe gestures can conflict with navigation gestures
- **State Persistence:** Don't store complex objects in navigation params
- **Performance:** Deep nesting can impact performance - max 4-5 levels

#### **🔧 Performance Optimizations**
```javascript
// Lazy load screens
const CameraScreen = lazy(() => import('../screens/CameraScreen'));
const ChatScreen = lazy(() => import('../screens/ChatScreen'));

// Use proper screen options for better performance
const screenOptions = {
  lazy: true,
  headerShown: false,
  animationEnabled: __DEV__ ? true : false, // Disable in production for performance
};

// Optimize tab bar rendering
const TabBarIcon = memo(({ name, focused }) => (
  <Icon name={name} color={focused ? '#0084FF' : '#666'} />
));
```

---

### **🗂️ Redux Toolkit + RTK Query**

#### **✅ Best Practices**
```javascript
// 1. Structure slices by feature, not by data type
// ❌ Bad: userSlice, postSlice, commentSlice
// ✅ Good: authSlice, chatSlice, storySlice

// 2. Use proper RTK Query patterns
const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Chat', 'Message', 'User'],
  endpoints: (builder) => ({
    getChats: builder.query({
      queryFn: async () => {
        // Always handle errors properly
        try {
          const chats = await getDocs(collection(db, 'chats'));
          return { data: chats.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
        } catch (error) {
          return { error: error.message };
        }
      },
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Chat', id })), 'Chat']
          : ['Chat'],
    }),
  }),
});

// 3. Use proper selector patterns
const selectUserChats = createSelector(
  [selectAllChats, (state, userId) => userId],
  (chats, userId) => chats.filter(chat => chat.participants.includes(userId))
);

// 4. Handle loading states consistently
const ChatList = () => {
  const { data: chats, isLoading, error } = useGetChatsQuery();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <FlatList data={chats} renderItem={renderChat} />;
};
```

#### **⚠️ Common Pitfalls & Limitations**
- **Over-normalization:** Don't normalize everything, especially for simple data
- **Cache Invalidation:** Be careful with tag invalidation - can cause performance issues
- **Memory Usage:** RTK Query caches everything - implement proper cache management
- **Real-time Updates:** Firestore listeners need manual cache updates

#### **🔧 Firebase Integration Patterns**
```javascript
// Real-time listener integration
const useFirestoreQuery = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const q = query(collection(db, collectionName), ...queryConstraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(docs);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [collectionName]);
  
  return { data, loading };
};

// Cache management for real-time data
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: {},
    typingUsers: {},
  },
  reducers: {
    messageReceived: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
    },
  },
});
```

---

### **🎨 NativeWind + StyleSheet**

#### **✅ Best Practices & Conventions**
```javascript
// 1. Use NativeWind for 80% of styling
const ChatBubble = ({ message, isSender }) => (
  <View className={`mx-4 my-1 ${isSender ? 'items-end' : 'items-start'}`}>
    <View className={`
      max-w-[80%] px-4 py-3 rounded-2xl
      ${isSender 
        ? 'bg-blue-500 rounded-br-md' 
        : 'bg-gray-200 rounded-bl-md'
      }
    `}>
      <Text className={`${isSender ? 'text-white' : 'text-black'}`}>
        {message.text}
      </Text>
    </View>
  </View>
);

// 2. Use StyleSheet for complex positioning/animations
const cameraStyles = StyleSheet.create({
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    // Complex calculations that utilities can't handle
    transform: [
      { translateX: faceDetection.x - 50 },
      { translateY: faceDetection.y - 50 },
    ],
  },
  captureButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center',
    // Platform-specific styling
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 8 },
    }),
  },
});

// 3. Custom Tailwind configuration
// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        snapYellow: '#FFFC00',
        snapBlue: '#0FADFF',
        chatBubbleSender: '#0084FF',
        chatBubbleReceiver: '#F0F0F0',
      },
      spacing: {
        'safe-top': '44px', // iOS safe area
        'safe-bottom': '34px',
        'camera-button': '80px',
      },
      borderRadius: {
        'bubble': '20px',
      },
    },
  },
  plugins: [],
};

// 4. Responsive patterns
const ResponsiveContainer = () => (
  <View className="
    px-4 py-2
    sm:px-6 sm:py-3
    md:px-8 md:py-4
    w-full max-w-sm mx-auto
  ">
    {/* Content */}
  </View>
);
```

#### **⚠️ Limitations & When to Use StyleSheet**
- **Dynamic Calculations:** Use StyleSheet for mathematical positioning
- **Platform Differences:** StyleSheet better for Platform.select()
- **Animations:** Complex animations need StyleSheet or Animated API
- **Performance Critical:** StyleSheet for 60fps requirements

#### **🚫 Common Anti-Patterns**
```javascript
// ❌ Don't use inline styles with NativeWind
<View style={{ backgroundColor: 'red' }} className="p-4" />

// ✅ Use Tailwind utilities or StyleSheet
<View className="bg-red-500 p-4" />

// ❌ Don't mix positioning systems
<View style={{ position: 'absolute', top: 10 }} className="absolute top-5" />

// ✅ Choose one approach per component
<View className="absolute top-5" />
```

---

### **✏️ React Native SVG + Gesture Handler**

#### **✅ Best Practices**
```javascript
// 1. Optimize SVG rendering
const DrawingCanvas = memo(({ paths, width, height }) => {
  // Use useMemo for expensive path calculations
  const optimizedPaths = useMemo(() => 
    paths.map(path => simplifyPath(path)), [paths]
  );

  return (
    <Svg width={width} height={height} style={styles.canvas}>
      {optimizedPaths.map((path, index) => (
        <Path
          key={path.id || index}
          d={path.data}
          stroke={path.color}
          strokeWidth={path.width}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
});

// 2. Gesture optimization
const DrawingGestureHandler = ({ onDraw }) => {
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      'worklet';
      // Start new path
      runOnJS(onDraw)({
        type: 'start',
        x: event.x,
        y: event.y,
      });
    },
    onActive: (event) => {
      'worklet';
      // Continue path - throttle updates
      if (event.absoluteX % 3 === 0) {
        runOnJS(onDraw)({
          type: 'move',
          x: event.x,
          y: event.y,
        });
      }
    },
    onEnd: () => {
      'worklet';
      runOnJS(onDraw)({ type: 'end' });
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={StyleSheet.absoluteFillObject} />
    </PanGestureHandler>
  );
};

// 3. Memory management for drawing
const useDrawingPaths = () => {
  const [paths, setPaths] = useState([]);
  const pathsRef = useRef([]);
  
  const addPath = useCallback((pathData) => {
    const newPath = { id: Date.now(), ...pathData };
    pathsRef.current = [...pathsRef.current, newPath];
    
    // Limit number of paths to prevent memory issues
    if (pathsRef.current.length > 50) {
      pathsRef.current = pathsRef.current.slice(-40);
    }
    
    setPaths([...pathsRef.current]);
  }, []);
  
  const clearPaths = useCallback(() => {
    pathsRef.current = [];
    setPaths([]);
  }, []);
  
  return { paths, addPath, clearPaths };
};
```

#### **⚠️ Performance Considerations**
- **Path Complexity:** Simplify paths to reduce rendering cost
- **Memory Usage:** Large SVGs can cause memory pressure
- **Gesture Throttling:** Don't update on every gesture event
- **Canvas Size:** Large canvases impact performance significantly

#### **🔧 Text Overlay Best Practices**
```javascript
const TextOverlay = ({ text, position, onMove }) => {
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.translateX = translateX.value;
      context.translateY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = context.translateX + event.translationX;
      translateY.value = context.translateY + event.translationY;
    },
    onEnd: () => {
      runOnJS(onMove)({
        x: translateX.value,
        y: translateY.value,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.textContainer, animatedStyle]}>
        <Text style={[styles.overlayText, { color: text.color }]}>
          {text.content}
        </Text>
      </Animated.View>
    </PanGestureHandler>
  );
};
```

---

### **📝 React Hook Form**

#### **✅ Best Practices**
```javascript
// 1. Validation schemas with proper error messages
const signUpSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .required('Username is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
});

// 2. Custom validation hooks
const useUsernameValidation = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length < 3) return;
      
      setIsChecking(true);
      try {
        const exists = await checkUsernameExists(username);
        setIsAvailable(!exists);
      } catch (error) {
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 500),
    []
  );
  
  return { checkUsername, isChecking, isAvailable };
};

// 3. Reusable form components
const FormInput = forwardRef(({ label, error, ...props }, ref) => (
  <View className="mb-4">
    <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
    <TextInput
      ref={ref}
      className={`
        border rounded-lg px-4 py-3 text-base
        ${error ? 'border-red-500' : 'border-gray-300'}
        focus:border-blue-500
      `}
      {...props}
    />
    {error && (
      <Text className="text-red-500 text-sm mt-1">{error}</Text>
    )}
  </View>
));

// 4. Form submission patterns
const SignUpForm = () => {
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(signUpSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Server-side validation
      const result = await createUser(data);
      if (!result.success) {
        // Set field-specific errors
        if (result.error.field) {
          setError(result.error.field, { message: result.error.message });
        }
        return;
      }
      
      // Success handling
      navigation.navigate('Camera');
    } catch (error) {
      // Handle network errors
      setError('root', { message: 'Network error. Please try again.' });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </Form>
  );
};
```

#### **⚠️ Common Pitfalls**
- **Re-render Issues:** Don't destructure watch() in render
- **Validation Timing:** Use proper mode (onBlur, onChange, onSubmit)
- **Memory Leaks:** Always cleanup async validation
- **Error State:** Handle both field and global errors

---

### **🔥 Firebase Best Practices & Security**

#### **✅ Firestore Security Rules**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat access control
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages belong to chats
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/chats/$(chatId)) &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
    
    // Friend requests
    match /friendRequests/{requestId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.fromUser || 
         request.auth.uid == resource.data.toUser);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.fromUser;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.toUser;
    }
    
    // Stories are public to friends
    match /stories/{storyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

#### **🔒 Cloud Storage Security Rules**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Snap storage - only sender and recipients can access
    match /snaps/{snapId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.metadata.senderId ||
         request.auth.uid in resource.metadata.recipients);
      allow write: if request.auth != null && 
        request.auth.uid == request.resource.metadata.senderId;
    }
    
    // Story storage
    match /stories/{userId}/{storyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### **⚡ Performance Optimizations**
```javascript
// 1. Batch operations
const sendSnapToMultipleUsers = async (snapData, recipients) => {
  const batch = writeBatch(db);
  
  recipients.forEach(recipientId => {
    const snapRef = doc(collection(db, 'snaps'));
    batch.set(snapRef, {
      ...snapData,
      recipientId,
      createdAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
};

// 2. Pagination for large datasets
const usePaginatedChats = (pageSize = 10) => {
  const [chats, setChats] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const loadMore = useCallback(async () => {
    setLoading(true);
    
    let q = query(
      collection(db, 'chats'),
      orderBy('lastMessage.timestamp', 'desc'),
      limit(pageSize)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const snapshot = await getDocs(q);
    const newChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    setChats(prev => [...prev, ...newChats]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  }, [lastDoc, pageSize]);
  
  return { chats, loadMore, loading };
};

// 3. Optimistic updates
const sendMessage = async (chatId, message) => {
  const tempId = `temp_${Date.now()}`;
  
  // Optimistic update
  dispatch(addMessage({
    id: tempId,
    ...message,
    status: 'sending',
    timestamp: new Date(),
  }));
  
  try {
    const docRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
      ...message,
      timestamp: serverTimestamp(),
    });
    
    // Update with real ID
    dispatch(updateMessage({
      tempId,
      id: docRef.id,
      status: 'sent',
    }));
  } catch (error) {
    // Mark as failed
    dispatch(updateMessage({
      tempId,
      status: 'failed',
    }));
  }
};
```

#### **💰 Cost Optimization**
```javascript
// 1. Efficient queries
// ❌ Expensive: Get all chats then filter
const expensiveQuery = async () => {
  const snapshot = await getDocs(collection(db, 'chats'));
  return snapshot.docs.filter(doc => doc.data().participants.includes(userId));
};

// ✅ Efficient: Use array-contains
const efficientQuery = async (userId) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId)
  );
  return await getDocs(q);
};

// 2. Cleanup expired content
const cleanupExpiredSnaps = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const expiredSnaps = await db.collection('snaps')
      .where('expiresAt', '<=', admin.firestore.Timestamp.now())
      .get();
    
    const batch = db.batch();
    const storage = admin.storage().bucket();
    
    expiredSnaps.docs.forEach(doc => {
      batch.delete(doc.ref);
      // Delete storage file
      storage.file(doc.data().storagePath).delete();
    });
    
    await batch.commit();
  });
```

---

## **General React Native Best Practices**

### **📱 Performance**
```javascript
// 1. FlatList optimization
const ChatList = ({ chats }) => {
  const renderChat = useCallback(({ item }) => (
    <ChatItem chat={item} />
  ), []);
  
  const keyExtractor = useCallback((item) => item.id, []);
  
  return (
    <FlatList
      data={chats}
      renderItem={renderChat}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      })}
    />
  );
};

// 2. Image optimization
const OptimizedImage = ({ uri, width, height }) => (
  <Image
    source={{ uri }}
    style={{ width, height }}
    resizeMode="cover"
    cache="force-cache"
    // Use proper sizing to avoid memory issues
    defaultSource={require('../assets/placeholder.png')}
  />
);

// 3. Memory management
const CameraScreen = () => {
  const [cameraRef, setCameraRef] = useState(null);
  
  useEffect(() => {
    return () => {
      // Cleanup camera resources
      if (cameraRef) {
        cameraRef.pausePreview();
      }
    };
  }, [cameraRef]);
  
  // Use useCallback for expensive operations
  const capturePhoto = useCallback(async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8, // Balance quality vs file size
        base64: false, // Avoid base64 for large images
        exif: false,
      });
      return photo;
    }
  }, [cameraRef]);
  
  return (
    <Camera
      ref={setCameraRef}
      style={StyleSheet.absoluteFillObject}
      type={Camera.Constants.Type.back}
    />
  );
};
```

### **🛡️ Error Handling**
```javascript
// 1. Error boundaries
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to crash reporting service
    crashlytics().recordError(error);
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg font-bold mb-4">Something went wrong</Text>
          <Text className="text-gray-600 text-center mb-6">
            We're sorry for the inconvenience. Please try restarting the app.
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return this.props.children;
  }
}

// 2. Network error handling
const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const makeCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      if (err.code === 'network-request-failed') {
        setError('Please check your internet connection');
      } else if (err.code === 'permission-denied') {
        setError('You do not have permission to perform this action');
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { makeCall, loading, error };
};
```

### **🔄 State Management Patterns**
```javascript
// 1. Proper selector usage
const selectChatMessages = createSelector(
  [selectAllMessages, (state, chatId) => chatId],
  (messages, chatId) => messages.filter(msg => msg.chatId === chatId)
    .sort((a, b) => a.timestamp - b.timestamp)
);

// 2. Avoid prop drilling
const ChatContext = createContext();

const ChatProvider = ({ children, chatId }) => {
  const chat = useSelector(state => selectChatById(state, chatId));
  const messages = useSelector(state => selectChatMessages(state, chatId));
  
  const value = useMemo(() => ({
    chat,
    messages,
    sendMessage: (text) => dispatch(sendMessage({ chatId, text })),
  }), [chat, messages, chatId]);
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// 3. Custom hooks for complex logic
const useChat = (chatId) => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
```

---

## **Common Pitfalls & Anti-Patterns**

### **❌ What NOT to Do**
```javascript
// 1. Don't use inline functions in render
// ❌ Bad - creates new function on every render
<TouchableOpacity onPress={() => navigation.navigate('Chat')}>

// ✅ Good - use useCallback
const navigateToChat = useCallback(() => {
  navigation.navigate('Chat');
}, [navigation]);

// 2. Don't store complex objects in state unnecessarily
// ❌ Bad
const [user, setUser] = useState({
  profile: { ... },
  settings: { ... },
  friends: [ ... ]
});

// ✅ Good - normalize and use Redux
const user = useSelector(selectCurrentUser);
const friends = useSelector(selectUserFriends);

// 3. Don't ignore memory leaks
// ❌ Bad - missing cleanup
useEffect(() => {
  const interval = setInterval(updateLocation, 1000);
  // Missing return cleanup!
}, []);

// ✅ Good - proper cleanup
useEffect(() => {
  const interval = setInterval(updateLocation, 1000);
  return () => clearInterval(interval);
}, []);

// 4. Don't block the main thread
// ❌ Bad - synchronous heavy operation
const processImage = (imageData) => {
  // Heavy image processing on main thread
  return heavyImageProcessing(imageData);
};

// ✅ Good - use worker threads or async processing
const processImage = async (imageData) => {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      const result = heavyImageProcessing(imageData);
      resolve(result);
    });
  });
};
```

---

This tech stack provides a solid foundation for building a professional-grade social media application with all the features outlined in your project requirements. 