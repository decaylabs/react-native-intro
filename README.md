# react-native-intro

A native React Native implementation of [intro.js](https://github.com/usablica/intro.js) — step-by-step user onboarding tours and contextual hints for mobile apps. This is not a wrapper around the web library; it's a complete reimplementation with feature parity to intro.js v8.0.0+.

## Features

- **Step-by-step tours** with spotlight overlay and smooth animations
- **Contextual hints** with pulsing indicators and tap-to-reveal tooltips
- **Props-based or programmatic** configuration
- **Rich tooltip content** — titles, images, custom React components
- **Floating tooltips** for welcome/intro screens (no target element)
- **Auto-scroll** to off-screen elements
- **Smart positioning** with automatic edge detection
- **Progress indicators** — progress bar and step bullets
- **Theming** — built-in themes (classic, modern, dark, auto) + custom themes
- **Persistence** — "Don't show again" with AsyncStorage
- **Accessibility** — VoiceOver/TalkBack, screen reader announcements, reduced motion
- **TypeScript** — full type definitions included

## Installation

```bash
npm install react-native-intro
# or
yarn add react-native-intro
# or
pnpm add react-native-intro
```

### Required Peer Dependencies

```bash
# Smooth animations (required)
npm install react-native-reanimated
```

Configure the Reanimated babel plugin in your `babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'], // Must be last
};
```

### Optional Dependencies

```bash
# "Don't show again" persistence
npm install @react-native-async-storage/async-storage
```

### Expo Users

Use `npx expo install` to automatically pick compatible versions for your SDK:

```bash
npx expo install react-native-intro react-native-reanimated @react-native-async-storage/async-storage
```

## Quick Start

### 1. Wrap Your App with IntroProvider

```tsx
import { IntroProvider } from 'react-native-intro';

export default function App() {
  return (
    <IntroProvider>
      <MyApp />
    </IntroProvider>
  );
}
```

### 2. Mark Elements as Tour Steps

```tsx
import { TourStep, useTour } from 'react-native-intro';
import { View, Text, Button } from 'react-native';

function HomeScreen() {
  const tour = useTour();

  return (
    <View>
      <TourStep id="welcome" order={1} intro="Welcome to the app!" title="Hello">
        <Text style={styles.header}>My App</Text>
      </TourStep>

      <TourStep id="profile" order={2} intro="Tap here to view your profile">
        <Button title="Profile" onPress={() => {}} />
      </TourStep>

      <TourStep id="settings" order={3} intro="Access settings here" position="left">
        <Button title="Settings" onPress={() => {}} />
      </TourStep>

      <Button title="Start Tour" onPress={() => tour.start()} />
    </View>
  );
}
```

### 3. Start the Tour

```tsx
// Props-based (recommended) - uses content from TourStep props
tour.start();

// With options
tour.start({ showProgress: true, dontShowAgain: true });

// For a specific group
tour.start('onboarding');
```

## API Reference

### Components

#### IntroProvider

Context provider that enables tour and hint functionality. Must wrap your entire app or the portion that uses tours/hints.

```tsx
<IntroProvider
  theme="classic"                    // 'classic' | 'modern' | 'dark' | 'auto' | Theme
  defaultTourOptions={{ ... }}       // TourOptions
  defaultHintOptions={{ ... }}       // HintOptions
  storageAdapter={customAdapter}     // Optional custom storage
  disablePersistence={false}         // Disable "Don't show again" persistence
>
  <App />
</IntroProvider>
```

#### TourStep

Wrapper component that registers an element as a tour step.

```tsx
<TourStep
  id="unique-id"           // Required: unique identifier
  order={1}                // Step order (lower = earlier)
  intro="Step content"     // Tooltip content (string or ReactNode)
  title="Step Title"       // Optional tooltip title
  position="auto"          // Tooltip position: top, bottom, left, right, auto
  disableInteraction       // Prevent touch on element during tour
  group="tour-name"        // Group identifier for multiple tours
>
  <YourComponent />
</TourStep>

// Floating step (no element highlight) - just omit children
<TourStep
  id="welcome"
  order={1}
  title="Welcome!"
  intro="This tooltip appears centered on screen."
/>
```

**Tooltip Positions:** `top`, `bottom`, `left`, `right`, `auto`

**Floating Steps:** Omit `children` for a centered tooltip without highlighting any element. Useful for welcome messages.

#### HintSpot

Wrapper component that registers an element as a hint anchor.

```tsx
<HintSpot
  id="unique-id"              // Required: unique identifier
  hint="Hint content"         // Hint tooltip content
  hintPosition="top-right"    // Indicator position
  hintAnimation={true}        // Pulsing animation
  hintType="default"          // 'default' | 'info' | 'warning' | 'error' | 'success'
>
  <YourComponent />
</HintSpot>
```

**Hint Positions:**
`top-left`, `top-center`, `top-right`, `middle-left`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`

### Hooks

#### useIntro

Combined hook providing both tour and hint controls.

```tsx
const { tour, hints, callbacks } = useIntro();

// Tour state
tour.isActive           // boolean
tour.tourId             // string | null
tour.currentStep        // number (0-based)
tour.totalSteps         // number
tour.currentStepConfig  // StepConfig | null
tour.isTransitioning    // boolean

// Tour controls
tour.start()                    // Start props-based tour
tour.start(options)             // With options
tour.start('tour-id')           // Specific group
tour.start('id', steps)         // Programmatic with steps
tour.start('id', steps, opts)   // With steps and options
tour.next()                     // Next step
tour.prev()                     // Previous step
tour.goTo(2)                    // Jump to step index
tour.stop()                     // End tour
tour.restart()                  // Restart from beginning
tour.isDismissed('tour-id')     // Check if permanently dismissed
tour.clearDismissed('tour-id')  // Clear dismissed state
tour.refresh()                  // Re-measure elements

// Hints state
hints.isVisible         // boolean
hints.activeHintId      // string | null
hints.hints             // HintConfig[]

// Hints controls
hints.show()                  // Show props-based hints
hints.show(options)           // With options
hints.show(configs)           // Programmatic with configs
hints.show(configs, options)  // With configs and options
hints.hide()                  // Hide all hints
hints.showHint('id')          // Show specific hint tooltip
hints.hideHint('id')          // Hide specific hint tooltip
hints.removeHint('id')        // Remove hint entirely
hints.refresh()               // Re-measure positions

// Callbacks
callbacks.setTourCallbacks({ ... })
callbacks.setHintCallbacks({ ... })
```

#### useTour

Tour-only hook (lighter weight if you don't need hints).

```tsx
const tour = useTour();
// Same API as useIntro().tour
```

#### useHints

Hints-only hook (lighter weight if you don't need tours).

```tsx
const hints = useHints();
// Same API as useIntro().hints
```

### Programmatic Tours

For dynamic content or CMS-driven tours:

```tsx
const tour = useTour();

// First, wrap elements with TourStep (just the id, no content props needed)
<TourStep id="welcome"><Header /></TourStep>
<TourStep id="profile"><ProfileButton /></TourStep>

// Then start with explicit step configs
tour.start('welcome-tour', [
  {
    id: 'step-1',
    targetId: 'welcome',  // Must match a TourStep id
    title: 'Welcome!',
    content: 'Let me show you around.',
  },
  {
    id: 'step-2',
    targetId: 'profile',  // Must match a TourStep id
    content: 'Tap here to view your profile.',
    position: 'bottom',
  },
  {
    id: 'step-3',
    // No targetId = floating tooltip (centered, no spotlight)
    title: 'You\'re all set!',
    content: 'Enjoy using the app.',
  },
]);
```

### Tour Options

```tsx
interface TourOptions {
  showProgress?: boolean;        // Show progress bar (default: true)
  showBullets?: boolean;         // Show step dots (default: true)
  showButtons?: boolean;         // Show nav buttons (default: true)
  exitOnOverlayClick?: boolean;  // Close on overlay tap (default: false)
  dontShowAgain?: boolean;       // Show checkbox (default: false)
  disableInteraction?: boolean;  // Block element touch (default: false)
  scrollToElement?: boolean;     // Auto-scroll (default: true)
  scrollPadding?: number | {     // Scroll padding (default: 50)
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  overlayOpacity?: number;       // 0-1 (default: 0.75)
  overlayColor?: string;         // Overlay color
  animate?: boolean | 'auto';    // Animations (default: 'auto')
  animationDuration?: number;    // Duration ms (default: 300)
  buttonLabels?: {
    next?: string;               // default: 'Next'
    prev?: string;               // default: 'Back'
    done?: string;               // default: 'Done'
    skip?: string;               // default: 'Skip'
    dontShowAgain?: string;      // default: "Don't show again"
  };
  tooltipStyle?: ViewStyle;
  overlayStyle?: ViewStyle;
}
```

### Hint Options

```tsx
interface HintOptions {
  autoShow?: boolean;            // Show on render (default: false)
  animation?: boolean;           // Pulsing animation (default: true)
  closeOnOutsideClick?: boolean; // Close on outside tap (default: true)
  indicatorSize?: number;        // Indicator size (default: 20)
  indicatorStyle?: ViewStyle;
  tooltipStyle?: ViewStyle;
}
```

### Callbacks

All `onBefore*` callbacks support both sync and async (Promise) return values. Return `false` to prevent the action.

```tsx
const { callbacks } = useIntro();

useEffect(() => {
  callbacks.setTourCallbacks({
    // Called before tour starts (async supported)
    onBeforeStart: async (tourId) => {
      const canStart = await checkPermissions();
      return canStart; // false prevents start
    },

    // Called after tour starts
    onStart: (tourId) => {
      analytics.track('tour_started', { tourId });
    },

    // Called before step change (async supported)
    onBeforeChange: async (currentStep, nextStep, direction) => {
      if (direction === 'next' && currentStep === 1) {
        const valid = await validateForm();
        if (!valid) {
          showError('Complete the form first');
          return false;
        }
      }
      return true;
    },

    // Called after step change
    onChange: (currentStep, previousStep) => {
      console.log(`Step ${previousStep} → ${currentStep}`);
    },

    // Called before tour exit (async supported)
    onBeforeExit: async (reason) => {
      if (reason !== 'completed') {
        return await showConfirmDialog('Exit tour?');
      }
      return true;
    },

    // Called after tour ends
    onComplete: (tourId, reason) => {
      analytics.track('tour_completed', { tourId, reason });
    },
  });

  callbacks.setHintCallbacks({
    onHintsShow: () => console.log('Hints shown'),
    onHintsHide: () => console.log('Hints hidden'),
    onHintClick: (hintId) => console.log(`Hint ${hintId} clicked`),
    onHintClose: (hintId) => console.log(`Hint ${hintId} closed`),
  });
}, []);
```

### Rich Tooltip Content

Tooltips support images and custom React components:

```tsx
tour.start('tutorial', [
  {
    id: 'step-1',
    targetId: 'feature',
    title: 'New Feature!',
    content: 'Check out this amazing feature.',
    image: {
      source: require('./feature.png'), // or { uri: 'https://...' }
      width: '100%',
      height: 150,
      borderRadius: 8,
      position: 'top', // 'top' | 'bottom'
      alt: 'Feature screenshot',
    },
  },
  {
    id: 'step-2',
    targetId: 'custom',
    title: 'Custom Content',
    content: (
      <View>
        <Text>Custom React component!</Text>
        <Button title="Learn More" onPress={handleLearnMore} />
      </View>
    ),
  },
]);
```

### Theming

#### Built-in Themes

```tsx
<IntroProvider theme="classic">  {/* default */}
<IntroProvider theme="modern">   {/* contemporary design */}
<IntroProvider theme="dark">     {/* dark mode */}
<IntroProvider theme="auto">     {/* follows system setting */}
```

#### Custom Theme

```tsx
import { IntroProvider, createTheme, mergeTheme, classicTheme } from 'react-native-intro';

// Full custom theme
const myTheme = createTheme({
  name: 'custom',
  overlay: {
    backgroundColor: '#000',
    opacity: 0.8,
  },
  tooltip: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    titleColor: '#fff',
    contentColor: '#e0e0e0',
    // ... other properties
  },
  buttons: {
    primary: {
      backgroundColor: '#4361ee',
      textColor: '#fff',
      // ...
    },
    secondary: { /* ... */ },
  },
  hint: { /* ... */ },
  progress: { /* ... */ },
});

// Or extend a built-in theme
const customTheme = mergeTheme(classicTheme, {
  overlay: { opacity: 0.9 },
  buttons: {
    primary: { backgroundColor: '#ff6b6b' },
  },
});

<IntroProvider theme={myTheme}>
  <App />
</IntroProvider>
```

### Auto-Scroll in ScrollViews

Register your ScrollView to enable auto-scrolling to off-screen elements:

```tsx
import { useScrollView } from 'react-native-intro';
import { ScrollView } from 'react-native';

function MyScreen() {
  const { scrollViewRef, scrollViewProps } = useScrollView();

  return (
    <ScrollView ref={scrollViewRef} {...scrollViewProps}>
      <TourStep id="step-1" intro="First element">
        <Text>Near top</Text>
      </TourStep>

      {/* ... lots of content ... */}

      <TourStep id="step-5" intro="Far down the page">
        <Text>Near bottom</Text>
      </TourStep>
    </ScrollView>
  );
}
```

For directional scroll padding (useful with fixed headers/tab bars):

```tsx
tour.start('tour', steps, {
  scrollPadding: {
    top: 80,     // Account for header
    bottom: 60,  // Account for tab bar
  },
});
```

### Custom Storage Adapter

Replace AsyncStorage with your own persistence:

```tsx
const customStorage = {
  getItem: async (key) => await myDB.get(key),
  setItem: async (key, value) => await myDB.set(key, value),
  removeItem: async (key) => await myDB.delete(key),
};

<IntroProvider storageAdapter={customStorage}>
  <App />
</IntroProvider>
```

### Accessibility

The library provides comprehensive accessibility support:

- **VoiceOver/TalkBack**: All interactive elements have proper labels
- **Screen reader announcements**: Step changes are announced
- **Reduced motion**: Respects system preference
- **Semantic roles**: Proper button, dialog, and progressbar roles

```tsx
// Check accessibility preferences
import { isReduceMotionEnabled, isScreenReaderEnabled } from 'react-native-intro';

const reduceMotion = await isReduceMotionEnabled();
const screenReader = await isScreenReaderEnabled();
```

## Platform Support

| Platform | Version |
|----------|---------|
| React Native | 0.81.0+ |
| React | 19.0.0+ |
| iOS | 15.1+ |
| Android | API 24+ |
| Expo | 54.0.0+ (compatible, not required) |

## TypeScript

Full TypeScript support with all types exported:

```tsx
import type {
  // Core types
  TourOptions,
  HintOptions,
  StepConfig,
  HintConfig,

  // Theme types
  Theme,
  ThemeName,

  // Callback types
  TourCallbacks,
  HintCallbacks,

  // State types
  TourState,
  TourStateInfo,
  HintsState,

  // Control types
  TourControls,
  HintControls,

  // Hook return type
  UseIntroReturn,

  // Component props
  IntroProviderProps,
  TourStepProps,
  HintSpotProps,
} from 'react-native-intro';
```

## Troubleshooting

### Tooltip appears in wrong position

Ensure the target element is rendered before starting:

```tsx
useEffect(() => {
  const timer = setTimeout(() => tour.start(), 100);
  return () => clearTimeout(timer);
}, []);
```

### "Element not found" warning

The `targetId` in programmatic tours must match the `id` of a `TourStep` component. The library only knows about elements wrapped in `TourStep`:

```tsx
// ✅ Correct - targetId matches TourStep id
<TourStep id="my-button">
  <Button title="Click" />
</TourStep>
tour.start('tour', [{ id: 'step-1', targetId: 'my-button', content: '...' }]);

// ❌ Wrong - no TourStep with this id
<Button id="my-button" title="Click" />  // Regular component, not registered!
tour.start('tour', [{ id: 'step-1', targetId: 'my-button', content: '...' }]);
```

### Animations not smooth

1. Ensure Reanimated is properly configured in `babel.config.js`
2. Clear Metro cache: `npx react-native start --reset-cache`
3. Rebuild the app

### Tour doesn't start for repeat users

If using `dontShowAgain: true`, the tour is persisted when dismissed:

```tsx
// Check if dismissed
if (tour.isDismissed('my-tour')) {
  // Show a "restart tour" button
}

// Clear dismissed state
tour.clearDismissed('my-tour');
```

## Contributing

See [DEVELOPER.md](./DEVELOPER.md) for development setup and [MAINTAINER.md](./MAINTAINER.md) for release procedures.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
