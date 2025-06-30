# **Snap Factor - AI-Powered K-12 Math Learning Platform**

> A revolutionary educational social media application that combines Snapchat-like features with AI-powered math tutoring for K-12 students

[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49.0-black.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green.svg)](https://openai.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-purple.svg)](https://www.pinecone.io/)

---

## **🎯 Project Overview**

Snap Factor is an innovative K-12 math learning platform that combines the engaging social features of Snapchat with powerful AI-driven educational tools. Students can share their mathematical achievements, get instant homework help, and learn collaboratively through ephemeral content and real-time messaging, all powered by advanced RAG (Retrieval-Augmented Generation) technology.

### **🧠 AI-Powered Learning Features**
- 📚 **Homework Helper**: Take a snap of any math problem for instant, step-by-step solutions with textbook citations
- 📖 **Define Mode**: Instantly look up mathematical terms and concepts with contextual definitions
- ✨ **Smart Captions**: AI-generated captions for math achievement posts
- 🔍 **Concept Explorer**: Interactive exploration of mathematical concepts with examples and practice problems
- 🏆 **Challenge a Friend**: Create and share math challenges based on learned concepts
- 📅 **Daily Math Challenge**: Personalized daily challenges tailored to grade level and learning progress

### **📱 Social Learning Features**
- 📸 **Math Snaps**: Share photos and videos of mathematical work that disappear after viewing
- 📖 **Learning Stories**: 24-hour broadcasts of math achievements and progress
- 💬 **Study Groups**: Real-time chat with classmates and study partners
- 👥 **Collaborative Problem Solving**: Group messaging for tackling difficult problems together
- 🎨 **Interactive Content**: Drawing tools for mathematical diagrams and explanations
- 🔒 **Safe Learning Environment**: Privacy-first design with educational content moderation

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

### **AI & RAG System**
- **Language Model**: OpenAI GPT-4 with Vision API
- **Vector Database**: Pinecone for semantic search
- **Knowledge Base**: OpenStax K-12 Math Textbooks
- **Embeddings**: OpenAI text-embedding-3-small
- **Image Analysis**: OpenAI Vision API for homework problem recognition

### **Camera & Media**
- **Camera**: Expo Camera
- **Drawing**: React Native SVG + Gesture Handler
- **Media Processing**: Expo Image Manipulator
- **Sharing**: React Native Share API

### **Development Tools**
- **Package Manager**: npm
- **Testing**: Jest + React Native Testing Library
- **Code Quality**: ESLint + Prettier
- **Development**: Expo Go (iOS/Android testing)

---

## **📱 Target Audience**

- **Primary**: K-12 students (ages 10-18) studying mathematics
- **Secondary**: Parents and educators supporting student learning
- **Platforms**: iOS (iPhone 16 Pro optimized), Android, Future Web/Desktop

---

## **🏗️ Project Architecture**

### **Development Philosophy**
- **AI-First Development**: Modular, well-documented code optimized for AI assistance
- **Educational Focus**: Every feature designed to enhance mathematical learning
- **500-Line File Limit**: Maximum readability and maintainability
- **Separation of Concerns**: Clear responsibility boundaries
- **Type Safety**: Comprehensive TypeScript implementation
- **Performance-First**: 60fps target with optimized rendering

### **Directory Structure**
```
SnapFactor/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Universal components (Button, Input)
│   │   ├── camera/          # Camera and snap editing components
│   │   ├── chat/            # Chat and messaging components
│   │   ├── rag/             # RAG-powered educational components
│   │   └── forms/           # Form-specific components
│   ├── screens/             # Screen-level components
│   │   ├── auth/            # Authentication screens
│   │   ├── camera/          # Camera and editing screens
│   │   ├── chat/            # Chat and messaging screens
│   │   └── stories/         # Stories screens
│   ├── services/            # External service integrations
│   │   ├── firebase/        # Firebase service modules
│   │   │   ├── rag.service.ts        # RAG system integration
│   │   │   ├── challenges.service.ts # Daily challenges
│   │   │   └── vision.service.ts     # Image analysis
│   │   └── notifications/   # Push notification services
│   ├── hooks/               # Custom React hooks
│   │   ├── auth/            # Authentication hooks
│   │   ├── challenges/      # Daily challenge hooks
│   │   ├── math/            # Math-specific hooks
│   │   └── rag/             # RAG system hooks
│   ├── store/               # Redux store and state management
│   │   ├── slices/          # Redux Toolkit slices
│   │   │   ├── auth.slice.ts
│   │   │   └── rag.slice.ts
│   │   └── api/             # RTK Query API definitions
│   ├── utils/               # Utility functions and helpers
│   ├── types/               # TypeScript type definitions
│   └── constants/           # Application-wide constants
├── functions/               # Firebase Cloud Functions
│   └── src/
│       ├── functions/       # RAG-powered Cloud Functions
│       │   └── mathHelp.functions.ts
│       └── services/        # Backend service modules
│           ├── rag.service.ts
│           └── vision.service.ts
├── data-ingestion/          # Knowledge base preparation
│   ├── scraped_data/        # OpenStax textbook content
│   └── ingest.py           # Data processing and embedding
├── assets/                  # Static assets (images, fonts, icons)
├── docs/                    # Project documentation
└── App.tsx                  # Root application component
```

---

## **🎨 Design System**

### **Theme: Educational Minimalism**
- **Primary Colors**: 
  - Education Blue: `#0FADFF`
  - Success Green: `#10B981`
  - Warning Orange: `#F59E0B`
- **Design Approach**: Mobile-first, learning-focused interface
- **Visual Style**: Clean backgrounds with subtle educational elements
- **Typography**: iOS Dynamic Type support with math symbol rendering
- **Spacing**: 8pt grid system for consistent layouts

### **Navigation Pattern**
- **Bottom Tabs**: Chat | Camera (Center) | Math Hub
- **Universal Header**: Profile + Search icons on every screen
- **Gesture Navigation**: Swipe left/right from camera for quick access
- **Context-Aware**: Smart back navigation based on learning flow

---

## **🧠 RAG System Implementation**

### **Knowledge Base**
- **Source**: OpenStax K-12 Mathematics Textbooks
- **Coverage**: Pre-Algebra through Calculus
- **Processing**: Chunked into semantic sections with metadata
- **Embeddings**: 1536-dimensional vectors using OpenAI's text-embedding-3-small

### **RAG Workflow**
1. **User Input**: Photo of math problem or text query
2. **Image Analysis**: OpenAI Vision API extracts problem text
3. **Embedding Creation**: Convert query to vector representation
4. **Semantic Search**: Query Pinecone for relevant textbook content
5. **Context Assembly**: Combine retrieved content with user query
6. **AI Generation**: GPT-4 generates educational response with citations
7. **Response Delivery**: Formatted explanation delivered to user

### **Educational Features**

#### **Homework Helper**
- Upload photos of math problems for instant help
- Step-by-step solutions with textbook citations
- Grade-appropriate explanations
- Progress tracking and learning analytics

#### **Daily Math Challenge**
- Personalized challenges based on grade level
- Scoring system with streak tracking
- Social sharing with Wordle-style results
- AI-powered difficulty adjustment

#### **Define Mode**
- Instant definitions of mathematical terms
- Contextual examples and applications
- Visual diagrams when applicable
- Related concept suggestions

---

## **🔧 Getting Started**

### **Prerequisites**
- Node.js 20+ (Required for Cloud Functions)
- npm package manager
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Emulator
- Firebase account and project setup
- OpenAI API key
- Pinecone account and API key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SnapFactor
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install
   ```

3. **Configure Firebase**
   ```bash
   # Initialize Firebase (if not already done)
   firebase init
   
   # Set up secret keys for Cloud Functions
   firebase functions:secrets:set OPENAI_API_KEY
   firebase functions:secrets:set PINECONE_API_KEY
   ```

4. **Set up environment variables**
   ```bash
   # Copy and configure environment file
   cp .env.example .env
   # Add your Firebase project configuration
   ```

5. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

6. **Start development server**
   ```bash
   npx expo start
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

### **Phase 0: Foundation Setup** ✅ **COMPLETED**
- ✅ Project initialization and Firebase integration
- ✅ Basic navigation structure
- ✅ Authentication system
- ✅ UI component library

### **Phase 1: MVP Social Features** ✅ **COMPLETED**
- ✅ Camera interface and snap capture
- ✅ Snap editing (text, drawing, stickers)
- ✅ Friend management system
- ✅ Real-time messaging
- ✅ Stories with 24-hour expiration

### **Phase 2: RAG Integration** ✅ **COMPLETED**
- ✅ OpenAI API integration
- ✅ Pinecone vector database setup
- ✅ Knowledge base ingestion (OpenStax textbooks)
- ✅ Homework Helper implementation
- ✅ Define Mode functionality
- ✅ Smart Caption generation

### **Phase 3: Advanced Learning Features** ✅ **COMPLETED**
- ✅ Concept Explorer with interactive examples
- ✅ Challenge a Friend system
- ✅ Daily Math Challenge with scoring
- ✅ Progress tracking and analytics
- ✅ Social sharing of achievements

### **Phase 4: Enhancement & Polish** 🚧 **IN PROGRESS**
- ⏳ Advanced AR filters for mathematical visualization
- ⏳ Voice input for math problems
- ⏳ Collaborative problem-solving features
- ⏳ Teacher dashboard and classroom integration
- ⏳ Performance optimizations

### **Phase 5: Advanced Features** ⏳ **PLANNED**
- ⏳ Adaptive learning algorithms
- ⏳ Gamification and achievement system
- ⏳ Parent and teacher analytics
- ⏳ Cross-platform web application
- ⏳ Integration with school LMS systems

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

# Test Cloud Functions locally
cd functions
npm run test
```

### **Testing Strategy**
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: RAG system and Firebase integration testing
- **E2E Tests**: Complete learning flow testing
- **Performance Tests**: 60fps target validation
- **Educational Tests**: Learning outcome validation

---

## **📊 Performance Targets**

- **App Startup**: < 3 seconds
- **Camera Launch**: < 500ms
- **RAG Response Time**: < 5 seconds for homework help
- **Frame Rate**: 60 FPS maintained
- **Memory Usage**: < 200MB during normal operation
- **Network Efficiency**: Optimized for mobile data usage

---

## **🎯 Educational Impact Goals**

### **Learning Outcomes**
- **Improved Math Comprehension**: 25% improvement in problem-solving skills
- **Increased Engagement**: 40% more time spent on math homework
- **Better Retention**: 30% improvement in concept retention
- **Collaborative Learning**: Enhanced peer-to-peer learning experiences

### **Usage Metrics**
- **Daily Active Users**: Target 10,000+ students
- **Problem Solving**: 1M+ math problems solved monthly
- **Knowledge Sharing**: 100,000+ educational snaps shared
- **Learning Streaks**: Average 7-day learning streak

---

## **🔒 Security & Privacy**

### **Educational Data Protection**
- COPPA and FERPA compliance for student data
- Secure storage for student work and progress
- Parental consent and control features
- Content moderation for educational appropriateness

### **AI Safety**
- Responsible AI practices for educational content
- Bias detection and mitigation in math explanations
- Transparent AI decision-making
- Human oversight of AI-generated educational content

---

## **📚 Documentation**

- **[Project Overview](docs/project-overview.md)** - Detailed feature requirements and educational goals
- **[RAG User Stories](docs/rag-user-stories.md)** - AI-powered learning feature specifications
- **[Tech Stack](docs/tech-stack.md)** - Comprehensive technology decisions and best practices
- **[User Flow](docs/user-flow.md)** - Complete navigation and learning interaction patterns
- **[Development Roadmap](docs/development-roadmap.md)** - Complete development timeline and milestones

---

## **🎯 Project Goals**

### **Short-term (6 months)**
- Launch MVP with core RAG-powered learning features
- Achieve 10,000+ student beta users
- Partner with 10+ schools for pilot programs
- App Store approval and educational category launch

### **Long-term (2-3 years)**
- 1M+ monthly active student users
- Comprehensive K-12 math curriculum coverage
- Integration with major school districts
- Expansion to other STEM subjects
- International market penetration

---

## **📄 License**

This project is proprietary and confidential. All rights reserved.
Educational content sourced from OpenStax under Creative Commons licensing.

---

## **📞 Contact**

**Project Owner**: Sean Stricker  
**Development Team**: AI-Assisted Development with Cursor  
**Project Start**: June 2025  
**Educational Focus**: K-12 Mathematics Learning

---

**Built with ❤️ for students, educators, and the future of learning**  
*Combining React Native, Firebase, OpenAI, and AI-first development principles* 
