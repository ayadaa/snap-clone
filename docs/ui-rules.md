# **UI Rules Document: SnapClone**

**Version:** 1.0  
**Date:** January 2025  
**Project:** SnapClone Mobile Application  
**Design System:** Dark Minimalism + Glassmorphic Overlays

---

## **Core Design Philosophy**

### **Mobile-First Approach**
- **Primary Target:** iPhone 16 Pro (6.1" OLED, 2556×1179, 460 PPI)
- **Secondary Targets:** iOS devices 5.4" - 6.7"
- **Design Priority:** Touch-first interactions, gesture-based navigation
- **Performance Target:** 60fps animations, <100ms response times

### **Dark Minimalism Principles**
- **Content-First:** User-generated media is the hero
- **Minimal UI Chrome:** Interface disappears, content remains
- **Contextual Visibility:** UI elements appear only when needed
- **Flat Hierarchy:** Minimal depth, maximum clarity
- **Intentional Whitespace:** Dark space as a design element

### **Glassmorphic Enhancement**
- **Subtle Depth:** Frosted glass overlays for controls
- **Contextual Blur:** Background content visible through UI
- **Light Interaction:** Gentle highlighting and feedback
- **Layered Architecture:** Clear z-index hierarchy

---

## **Layout & Spacing Rules**

### **Safe Area Management**
```css
/* Always account for device safe areas */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### **Spacing Scale (8pt Grid)**
- **xs:** 4px - Fine details, border widths
- **sm:** 8px - Tight element spacing
- **md:** 16px - Standard component spacing
- **lg:** 24px - Section separation
- **xl:** 32px - Major layout breaks
- **2xl:** 48px - Screen-level spacing
- **3xl:** 64px - Hero spacing

### **Touch Target Guidelines**
- **Minimum:** 44x44pt (iOS standard)
- **Recommended:** 48x48pt (comfortable tapping)
- **Primary Actions:** 56x56pt (camera capture, send buttons)
- **Gesture Areas:** Minimum 88pt width for swipe zones

### **Content Areas**
- **Full-Screen Media:** Edge-to-edge (Camera, Story viewer)
- **Chat Content:** 16px horizontal padding, safe area respected
- **List Items:** 16px horizontal, 12px vertical padding
- **Modal Content:** 24px padding from screen edges

---

## **Navigation & Interaction Patterns**

### **Primary Navigation**
- **Bottom Tabs:** Chat | Camera | Stories
- **Center Emphasis:** Camera tab prominently centered
- **Universal Header:** Profile + Search accessible from all screens
- **Gesture Priority:** Swipe left/right for primary navigation

### **Secondary Navigation**
- **Contextual Back:** Context-aware return navigation
- **Modal Presentation:** Profile, Settings, Story viewer
- **Stack Navigation:** Chat conversations, editing flows
- **Deep Linking:** Direct access to chats, profiles, stories

### **Gesture Interactions**
- **Horizontal Swipe:** Primary screen navigation (Camera ↔ Chat ↔ Stories)
- **Vertical Swipe:** Secondary actions (dismiss modals, story navigation)
- **Long Press:** Context menus, video recording
- **Pinch/Pan:** Media manipulation (zoom, draw)
- **Pull to Refresh:** Chat lists, friend updates

### **Button Hierarchy**
1. **Primary:** Floating action buttons (Camera capture, Send)
2. **Secondary:** Tab bar items, navigation controls
3. **Tertiary:** List item actions, settings options
4. **Destructive:** Delete, block, report actions

---

## **Content & Media Guidelines**

### **Camera Interface Rules**
- **Full-Screen Preview:** No UI chrome during composition
- **Overlay Controls:** Minimal, contextual, glassmorphic
- **Capture Feedback:** Immediate visual/haptic response
- **AR Filter Integration:** Seamless, non-intrusive overlay

### **Media Display Standards**
- **Aspect Ratios:** Preserve original ratios when possible
- **Loading States:** Blur-up technique for smooth loading
- **Error States:** Graceful fallbacks with retry options
- **Quality Optimization:** Adaptive based on network/device

### **Text Content Rules**
- **Message Bubbles:** Asymmetric design (sender/receiver differentiation)
- **Ephemeral Indicators:** Clear visual countdown/expiration cues
- **Status Communication:** Delivered, read, expired states
- **Input Areas:** Auto-expanding, character limits visible

---

## **Accessibility Standards**

### **Visual Accessibility**
- **Contrast Ratios:** WCAG AAA compliance (7:1 for normal text)
- **Color Independence:** Never rely solely on color for information
- **Focus Indicators:** High-contrast, clearly visible focus states
- **Text Scaling:** Support for Dynamic Type (iOS)

### **Motor Accessibility**
- **Touch Targets:** Minimum 44pt, well-spaced
- **Gesture Alternatives:** Always provide button alternatives
- **One-Handed Use:** Primary actions within thumb reach
- **Shake Gestures:** Optional, not required for core functions

### **Cognitive Accessibility**
- **Consistent Patterns:** Predictable navigation and interactions
- **Clear Labeling:** Descriptive button text and icons
- **Error Prevention:** Confirmation for destructive actions
- **Progressive Disclosure:** Complex features introduced gradually

### **Screen Reader Support**
- **VoiceOver Labels:** Descriptive, context-aware labels
- **Reading Order:** Logical flow through interface elements
- **State Communication:** Clear indication of interactive states
- **Media Descriptions:** Alt text for images, video descriptions

---

## **Animation & Transition Guidelines**

### **Animation Principles**
- **Purposeful Motion:** Every animation serves user understanding
- **Natural Easing:** iOS standard curves (ease-in-out)
- **Performance First:** 60fps target, hardware acceleration
- **Respectful of Preferences:** Honor reduced motion settings

### **Transition Timings**
- **Micro-interactions:** 150ms (button presses, toggles)
- **Screen Transitions:** 300ms (navigation, modal presentation)
- **Content Loading:** 200ms (fade-in, skeleton to content)
- **Gesture Following:** Real-time (drawing, panning)

### **Glassmorphic Animation**
- **Blur Intensity:** Gradual changes (0.5s duration)
- **Opacity Shifts:** Subtle (0.7 to 0.9 range)
- **Background Movement:** Parallax scrolling behind glass
- **Interactive Feedback:** Immediate glass surface response

### **Loading States**
- **Skeleton Screens:** For predictable content layouts
- **Shimmer Effects:** For list-based content loading
- **Progress Indicators:** For determinate processes (uploads)
- **Spinner Usage:** Only for indeterminate waits <2s

---

## **Error States & Edge Cases**

### **Network Error Handling**
- **Offline States:** Clear communication, cached content available
- **Failed Uploads:** Retry mechanisms, draft preservation
- **Slow Connections:** Progressive loading, low-data modes
- **Server Errors:** Friendly messaging, escalation paths

### **Permission States**
- **Camera Denied:** Clear explanation, settings deep-link
- **Microphone Denied:** Fallback to photo-only mode
- **Notification Denied:** App still functional, feature explanation
- **Location Optional:** Graceful degradation of location features

### **Content Edge Cases**
- **Empty States:** Engaging, actionable empty state designs
- **No Friends:** Onboarding flow to discover and add friends
- **Expired Content:** Clear messaging, archive options
- **Failed Media:** Retry options, fallback placeholder content

### **Device Edge Cases**
- **Low Storage:** Warning system, cleanup suggestions
- **Low Battery:** Reduce background activity, optimize performance
- **Older Devices:** Graceful feature degradation
- **Small Screens:** Adaptive layouts, essential content priority

---

## **Performance Guidelines**

### **Rendering Optimization**
- **60fps Target:** All animations and scrolling
- **Lazy Loading:** Off-screen content loads as needed
- **Image Optimization:** Appropriate sizes, modern formats
- **Memory Management:** Aggressive cleanup of unused resources

### **Network Optimization**
- **Adaptive Bitrates:** Quality based on connection speed
- **Caching Strategy:** Intelligent prefetching, LRU eviction
- **Offline Support:** Core functionality available offline
- **Background Sync:** Seamless sync when connection returns

### **Battery Optimization**
- **Dark UI Advantage:** OLED power savings with true black
- **Location Services:** Minimize GPS usage, intelligent batching
- **Background Processing:** Minimal when app not active
- **Camera Management:** Efficient preview, quick capture

---

## **Platform-Specific Considerations**

### **iOS Design Integration**
- **System Colors:** Dynamic color support for dark/light modes
- **SF Symbols:** Consistent iconography with system
- **Haptic Feedback:** Meaningful, contextual vibrations
- **Control Center:** Proper audio session management

### **iPhone 16 Pro Optimizations**
- **ProMotion Display:** 120Hz smooth scrolling and animations
- **Action Button:** Custom shortcuts for power users
- **Enhanced Cameras:** Full utilization of Pro camera features
- **Always-On Display:** Respectful of always-on content

### **Keyboard & Input**
- **Contextual Keyboards:** Appropriate input types (email, numeric)
- **Autocomplete:** Smart suggestions for usernames, messages
- **Voice Input:** Seamless integration with system speech recognition
- **External Keyboards:** Full keyboard shortcut support

---

## **Quality Assurance Rules**

### **Design Review Checklist**
- [ ] Mobile-first layout tested on smallest target device
- [ ] Dark mode appearance consistent across all screens
- [ ] Glassmorphic effects render properly at all opacity levels
- [ ] Touch targets meet minimum size requirements
- [ ] Accessibility labels present and descriptive
- [ ] Animation performance tested on older hardware
- [ ] Content fits properly in all safe area configurations
- [ ] Error states designed and implemented
- [ ] Loading states provide appropriate feedback
- [ ] Consistent spacing using defined scale

### **User Testing Protocol**
- **One-Handed Usage:** Primary tasks completable with thumb
- **Glare Resistance:** UI visible in bright sunlight
- **Low-Light Usage:** Dark mode comfortable in dark environments
- **Distracted Usage:** Core functions work with partial attention
- **Gesture Discovery:** New users can discover swipe navigation

### **Performance Benchmarks**
- **App Launch:** <2s cold start, <1s warm start
- **Screen Transitions:** <300ms between screens
- **Camera Launch:** <500ms from app open to camera ready
- **Message Send:** <100ms from tap to UI feedback
- **Media Upload:** Progress indication within 200ms

---

## **Design Token Structure**

All specific values (colors, fonts, shadows) are defined in `theme-rules.md`. This document establishes the principles and patterns for their application.

### **Token Categories**
- **Colors:** Semantic color assignments (primary, secondary, surfaces)
- **Typography:** Font scales, weights, line heights
- **Spacing:** Margin, padding, and layout spacing values
- **Shadows:** Depth and glassmorphic effect definitions
- **Animations:** Duration, easing, and transition specifications

### **Usage Guidelines**
- **Consistency:** Always use defined tokens, never hard-coded values
- **Semantic Naming:** Colors named by purpose, not appearance
- **Contextual Application:** Different tokens for different use cases
- **Future-Proofing:** Tokens allow easy theme updates

---

This UI Rules document serves as the definitive guide for creating consistent, accessible, and performant user interfaces throughout the SnapClone application. All design decisions should be evaluated against these principles to ensure a cohesive user experience. 