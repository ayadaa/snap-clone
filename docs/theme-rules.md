# **Theme Rules Document: SnapClone**

**Version:** 1.0  
**Date:** January 2025  
**Project:** SnapClone Mobile Application  
**Design System:** Dark Minimalism + Glassmorphic Overlays

---

## **Color System**

### **Base Color Palette**

#### **Neutral Colors (Dark Minimalism Foundation)**
```css
/* True Black - OLED Power Optimization */
--color-black: #000000;
--color-rich-black: #0A0A0A;
--color-charcoal: #1C1C1E;

/* Dark Grays */
--color-gray-900: #1C1C1E;  /* Primary surface */
--color-gray-800: #2C2C2E;  /* Secondary surface */
--color-gray-700: #3A3A3C;  /* Tertiary surface */
--color-gray-600: #48484A;  /* Subdued elements */
--color-gray-500: #636366;  /* Disabled text */
--color-gray-400: #8E8E93;  /* Secondary text */
--color-gray-300: #AEAEB2;  /* Tertiary text */
--color-gray-200: #C7C7CC;  /* Quaternary text */
--color-gray-100: #F2F2F7;  /* Light mode text (contrast) */

/* Pure White */
--color-white: #FFFFFF;     /* Primary text on dark */
--color-off-white: #F9F9F9; /* Secondary text on dark */
```

#### **Brand Colors**
```css
/* Primary Brand - Snap Yellow */
--color-snap-yellow: #FFFC00;      /* Primary brand color */
--color-snap-yellow-dark: #E6E300;  /* Pressed state */
--color-snap-yellow-light: #FFFD4D; /* Hover state */

/* Secondary Brand - Electric Blue */
--color-snap-blue: #0FADFF;        /* Secondary brand */
--color-snap-blue-dark: #0E9CE6;   /* Pressed state */
--color-snap-blue-light: #42C1FF;  /* Hover state */

/* Accent Colors */
--color-purple: #5856D6;           /* Stories, premium features */
--color-pink: #FF2D92;             /* Hearts, likes, reactions */
--color-green: #30D158;            /* Success, online status */
--color-orange: #FF9500;           /* Warnings, notifications */
--color-red: #FF3B30;              /* Errors, destructive actions */
```

### **Semantic Color Assignments**

#### **Background Colors**
```css
/* App Backgrounds */
--bg-primary: var(--color-black);        /* Camera, Story viewer */
--bg-secondary: var(--color-gray-900);   /* Chat list, Settings */
--bg-tertiary: var(--color-gray-800);    /* Modal backgrounds */
--bg-elevated: var(--color-gray-700);    /* Cards, elevated surfaces */

/* Content Backgrounds */
--bg-chat-bubble-sent: var(--color-snap-blue);
--bg-chat-bubble-received: var(--color-gray-700);
--bg-input: var(--color-gray-800);
--bg-button-primary: var(--color-snap-yellow);
--bg-button-secondary: var(--color-gray-700);
--bg-overlay: rgba(0, 0, 0, 0.75);       /* Modal backdrop */
```

#### **Text Colors**
```css
/* Primary Text */
--text-primary: var(--color-white);          /* Main content */
--text-secondary: var(--color-gray-300);     /* Subtitles, metadata */
--text-tertiary: var(--color-gray-400);      /* Captions, timestamps */
--text-disabled: var(--color-gray-500);      /* Disabled states */

/* Contextual Text */
--text-on-brand: var(--color-black);         /* Text on yellow/blue */
--text-success: var(--color-green);          /* Success messages */
--text-warning: var(--color-orange);         /* Warning messages */
--text-error: var(--color-red);              /* Error messages */
--text-link: var(--color-snap-blue);         /* Links, actions */
```

#### **Border Colors**
```css
--border-primary: var(--color-gray-600);     /* Main borders */
--border-secondary: var(--color-gray-700);   /* Subtle dividers */
--border-focus: var(--color-snap-blue);      /* Input focus states */
--border-error: var(--color-red);            /* Error states */
--border-glass: rgba(255, 255, 255, 0.1);   /* Glassmorphic borders */
```

### **Glassmorphic Color System**

#### **Glass Surface Colors**
```css
/* Primary Glass Surfaces */
--glass-surface-1: rgba(28, 28, 30, 0.8);   /* Main UI overlays */
--glass-surface-2: rgba(44, 44, 46, 0.7);   /* Secondary overlays */
--glass-surface-3: rgba(58, 58, 60, 0.6);   /* Tertiary overlays */

/* Interactive Glass */
--glass-interactive: rgba(255, 255, 255, 0.1);      /* Hover state */
--glass-interactive-pressed: rgba(255, 255, 255, 0.2); /* Pressed state */

/* Glass Tints */
--glass-tint-blue: rgba(15, 173, 255, 0.15);        /* Blue-tinted glass */
--glass-tint-yellow: rgba(255, 252, 0, 0.15);       /* Yellow-tinted glass */
--glass-tint-purple: rgba(88, 86, 214, 0.15);       /* Purple-tinted glass */
```

#### **Backdrop Filters**
```css
/* Blur Effects */
--blur-light: blur(10px);        /* Subtle background blur */
--blur-medium: blur(20px);       /* Standard UI blur */
--blur-heavy: blur(40px);        /* Strong blur for focus */

/* Backdrop Combinations */
--backdrop-glass-light: blur(10px) saturate(1.2);
--backdrop-glass-medium: blur(20px) saturate(1.4) brightness(1.1);
--backdrop-glass-heavy: blur(40px) saturate(1.6) brightness(1.2);
```

---

## **Typography System**

### **Font Family Stack**
```css
/* Primary Font - System Font Stack */
--font-primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

/* Monospace - For timestamps, codes */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;
```

### **Font Weight Scale**
```css
--font-weight-thin: 100;        /* Ultra-light text */
--font-weight-light: 300;       /* Light text */
--font-weight-regular: 400;     /* Body text */
--font-weight-medium: 500;      /* Emphasis */
--font-weight-semibold: 600;    /* Headings */
--font-weight-bold: 700;        /* Strong emphasis */
--font-weight-heavy: 800;       /* Hero text */
--font-weight-black: 900;       /* Maximum impact */
```

### **Font Size Scale (Responsive)**
```css
/* Mobile-First Typography Scale */
--text-xs: 0.75rem;    /* 12px - Captions, fine print */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Headings */
--text-2xl: 1.5rem;    /* 24px - Large headings */
--text-3xl: 1.875rem;  /* 30px - Display text */
--text-4xl: 2.25rem;   /* 36px - Hero text */

/* Dynamic Type Support (iOS) */
--text-body: -apple-system-body;
--text-headline: -apple-system-headline;
--text-subheadline: -apple-system-subheadline;
--text-caption1: -apple-system-caption1;
--text-caption2: -apple-system-caption2;
```

### **Line Heights**
```css
--line-height-tight: 1.25;      /* Dense text */
--line-height-normal: 1.5;      /* Standard readability */
--line-height-relaxed: 1.75;    /* Comfortable reading */
--line-height-loose: 2;         /* Maximum legibility */
```

### **Typography Semantic Classes**
```css
/* Heading Styles */
.text-hero {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--text-primary);
}

.text-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--text-primary);
}

.text-subtitle {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
}

/* Body Text */
.text-body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
}

.text-body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
}

/* Utility Text */
.text-caption {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  color: var(--text-tertiary);
}

.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
}
```

---

## **Shadow & Depth System**

### **Standard Shadow Levels**
```css
/* Subtle Shadows - Dark Mode Optimized */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.4), 0 10px 10px rgba(0, 0, 0, 0.3);

/* Colored Shadows */
--shadow-blue: 0 4px 14px rgba(15, 173, 255, 0.3);
--shadow-yellow: 0 4px 14px rgba(255, 252, 0, 0.3);
--shadow-purple: 0 4px 14px rgba(88, 86, 214, 0.3);

/* Inner Shadows (Glass Effect) */
--shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.1);
--shadow-inset-strong: inset 0 1px 2px rgba(255, 255, 255, 0.15);
```

### **Glassmorphic Shadow System**
```css
/* Glass Surface Shadows */
--shadow-glass-light: 
  0 8px 16px rgba(0, 0, 0, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);

--shadow-glass-medium: 
  0 12px 24px rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.15),
  inset 0 -1px 0 rgba(0, 0, 0, 0.1);

--shadow-glass-heavy: 
  0 20px 40px rgba(0, 0, 0, 0.5),
  inset 0 2px 0 rgba(255, 255, 255, 0.2),
  inset 0 -2px 0 rgba(0, 0, 0, 0.15);

/* Interactive Glass Shadows */
--shadow-glass-hover: 
  0 16px 32px rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.2);

--shadow-glass-pressed: 
  0 4px 8px rgba(0, 0, 0, 0.4),
  inset 0 2px 4px rgba(0, 0, 0, 0.2);
```

---

## **Spacing & Layout Tokens**

### **Spacing Scale (8pt Grid System)**
```css
/* Base Spacing Unit */
--space-unit: 8px;

/* Spacing Scale */
--space-0: 0;                          /* 0px */
--space-1: calc(var(--space-unit) * 0.5);  /* 4px */
--space-2: var(--space-unit);              /* 8px */
--space-3: calc(var(--space-unit) * 1.5);  /* 12px */
--space-4: calc(var(--space-unit) * 2);    /* 16px */
--space-5: calc(var(--space-unit) * 2.5);  /* 20px */
--space-6: calc(var(--space-unit) * 3);    /* 24px */
--space-8: calc(var(--space-unit) * 4);    /* 32px */
--space-10: calc(var(--space-unit) * 5);   /* 40px */
--space-12: calc(var(--space-unit) * 6);   /* 48px */
--space-16: calc(var(--space-unit) * 8);   /* 64px */
--space-20: calc(var(--space-unit) * 10);  /* 80px */
--space-24: calc(var(--space-unit) * 12);  /* 96px */
--space-32: calc(var(--space-unit) * 16);  /* 128px */
```

### **Semantic Spacing**
```css
/* Component Spacing */
--space-component-xs: var(--space-1);    /* Tight component spacing */
--space-component-sm: var(--space-2);    /* Small component spacing */
--space-component-md: var(--space-4);    /* Standard component spacing */
--space-component-lg: var(--space-6);    /* Large component spacing */
--space-component-xl: var(--space-8);    /* Extra large spacing */

/* Layout Spacing */
--space-section: var(--space-12);        /* Between major sections */
--space-page: var(--space-6);            /* Page-level padding */
--space-modal: var(--space-6);           /* Modal content padding */
--space-safe-area: var(--space-4);       /* Additional safe area buffer */
```

### **Border Radius Scale**
```css
/* Border Radius */
--radius-none: 0;
--radius-sm: 4px;         /* Small elements */
--radius-md: 8px;         /* Standard elements */
--radius-lg: 12px;        /* Cards, modals */
--radius-xl: 16px;        /* Large cards */
--radius-2xl: 24px;       /* Hero elements */
--radius-full: 9999px;    /* Circular elements */

/* Semantic Border Radius */
--radius-button: var(--radius-lg);       /* Standard buttons */
--radius-card: var(--radius-xl);         /* Content cards */
--radius-modal: var(--radius-2xl);       /* Modal corners */
--radius-chat-bubble: 18px;              /* Chat message bubbles */
```

---

## **Component-Specific Tokens**

### **Button Styles**
```css
/* Primary Button */
.button-primary {
  background: var(--bg-button-primary);
  color: var(--text-on-brand);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-md);
}

.button-primary:hover {
  background: var(--color-snap-yellow-light);
  box-shadow: var(--shadow-lg);
}

.button-primary:active {
  background: var(--color-snap-yellow-dark);
  box-shadow: var(--shadow-sm);
}

/* Glass Button */
.button-glass {
  background: var(--glass-surface-1);
  backdrop-filter: var(--backdrop-glass-medium);
  border: 1px solid var(--border-glass);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-glass-light);
}

.button-glass:hover {
  background: var(--glass-interactive);
  box-shadow: var(--shadow-glass-hover);
}

.button-glass:active {
  background: var(--glass-interactive-pressed);
  box-shadow: var(--shadow-glass-pressed);
}
```

### **Chat Bubble Styles**
```css
/* Sent Message Bubble */
.chat-bubble-sent {
  background: var(--bg-chat-bubble-sent);
  color: var(--color-white);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-chat-bubble);
  border-bottom-right-radius: var(--space-1);
  box-shadow: var(--shadow-sm);
  margin-left: var(--space-12);
  align-self: flex-end;
}

/* Received Message Bubble */
.chat-bubble-received {
  background: var(--bg-chat-bubble-received);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-chat-bubble);
  border-bottom-left-radius: var(--space-1);
  box-shadow: var(--shadow-sm);
  margin-right: var(--space-12);
  align-self: flex-start;
}
```

### **Input Field Styles**
```css
.input-field {
  background: var(--bg-input);
  border: 1px solid var(--border-secondary);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
}

.input-field:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 2px rgba(15, 173, 255, 0.2);
}

.input-field::placeholder {
  color: var(--text-tertiary);
}
```

### **Glass Overlay Styles**
```css
/* Camera UI Overlay */
.camera-overlay {
  background: var(--glass-surface-1);
  backdrop-filter: var(--backdrop-glass-medium);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-glass-light);
  border: 1px solid var(--border-glass);
}

/* Story Viewer Controls */
.story-controls {
  background: var(--glass-surface-2);
  backdrop-filter: var(--backdrop-glass-heavy);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  box-shadow: var(--shadow-glass-medium);
  border: 1px solid var(--border-glass);
}

/* Modal Backdrop */
.modal-backdrop {
  background: var(--bg-overlay);
  backdrop-filter: var(--blur-medium);
}

.modal-content {
  background: var(--glass-surface-1);
  backdrop-filter: var(--backdrop-glass-heavy);
  border-radius: var(--radius-modal);
  padding: var(--space-6);
  box-shadow: var(--shadow-glass-heavy);
  border: 1px solid var(--border-glass);
}
```

---

## **Animation Tokens**

### **Duration Values**
```css
/* Animation Durations */
--duration-instant: 0ms;          /* Immediate feedback */
--duration-fast: 150ms;           /* Quick interactions */
--duration-normal: 300ms;         /* Standard transitions */
--duration-slow: 500ms;           /* Deliberate animations */
--duration-slower: 750ms;         /* Emphasis animations */
--duration-slowest: 1000ms;       /* Loading/reveal animations */
```

### **Easing Functions**
```css
/* iOS-Style Easing */
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);      /* Standard ease out */
--ease-in: cubic-bezier(0.55, 0.06, 0.68, 0.19);       /* Standard ease in */
--ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);         /* Standard ease in-out */

/* Custom Easing */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Bounce effect */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);           /* Material Design */
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);            /* Quick transitions */
```

### **Transform Origins**
```css
--origin-center: center center;
--origin-top: center top;
--origin-bottom: center bottom;
--origin-left: left center;
--origin-right: right center;
```

---

## **Breakpoint System**

### **Mobile-First Breakpoints**
```css
/* Device Breakpoints */
--breakpoint-xs: 320px;   /* iPhone SE, small phones */
--breakpoint-sm: 375px;   /* iPhone 12/13/14 standard */
--breakpoint-md: 390px;   /* iPhone 12/13/14 Pro */
--breakpoint-lg: 414px;   /* iPhone 12/13/14 Pro Max */
--breakpoint-xl: 430px;   /* iPhone 14 Pro Max, newer large phones */

/* Responsive Containers */
--container-xs: 100%;
--container-sm: 100%;
--container-md: 100%;
--container-lg: 100%;
--container-xl: 100%;
```

---

## **Usage Guidelines & Best Practices**

### **Color Usage Rules**
1. **Primary Brand Colors:** Use sparingly for key actions and brand moments
2. **Background Hierarchy:** Maintain clear distinction between surface levels
3. **Text Contrast:** Always test against WCAG AAA standards (7:1 ratio)
4. **Glass Effects:** Limit to 2-3 levels of glass surfaces per screen
5. **Semantic Colors:** Use consistent colors for similar action types

### **Typography Rules**
1. **Dynamic Type:** Always support iOS Dynamic Type for accessibility
2. **Line Length:** Max 60-70 characters per line for readability
3. **Hierarchy:** Use max 3-4 typography levels per screen
4. **Weight Usage:** Use semibold sparingly, regular for body text
5. **Color Pairing:** Ensure sufficient contrast with background colors

### **Spacing Rules**
1. **8pt Grid:** All spacing should be multiples of 8px
2. **Touch Targets:** Minimum 44pt for interactive elements
3. **Consistent Gaps:** Use same spacing between similar elements
4. **Safe Areas:** Always respect device safe area insets
5. **Content Padding:** Minimum 16px from screen edges for text content

### **Glass Effect Guidelines**
1. **Subtle Application:** Glass should enhance, not dominate the interface
2. **Performance:** Limit blur effects on older devices
3. **Content Visibility:** Ensure readability through glass surfaces
4. **Interaction Feedback:** Glass should respond to touch with subtle changes
5. **Layering:** Maximum 3 levels of glass depth per view

---

## **Implementation Notes**

### **CSS Custom Properties Setup**
```css
:root {
  /* Import all color variables */
  /* Import all typography variables */
  /* Import all spacing variables */
  /* Import all animation variables */
}

/* Dark mode support (if needed for system integration) */
@media (prefers-color-scheme: dark) {
  :root {
    /* Already optimized for dark - no changes needed */
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
  }
}
```

### **NativeWind/Tailwind Integration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind classes
        'snap-yellow': 'var(--color-snap-yellow)',
        'snap-blue': 'var(--color-snap-blue)',
        'glass-surface-1': 'var(--glass-surface-1)',
        // ... other color mappings
      },
      fontFamily: {
        'sans': 'var(--font-primary)',
        'mono': 'var(--font-mono)',
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        // ... other size mappings
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        // ... other spacing mappings
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        // ... other radius mappings
      },
      boxShadow: {
        'glass-light': 'var(--shadow-glass-light)',
        'glass-medium': 'var(--shadow-glass-medium)',
        // ... other shadow mappings
      },
    },
  },
}
```

---

This theme system provides the complete visual foundation for the SnapClone application, ensuring consistency, accessibility, and adherence to the Dark Minimalism + Glassmorphic Overlays design philosophy. 