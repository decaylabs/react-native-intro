# react-native-intro - Complete Library Documentation for AI Agents

This document provides complete documentation for the react-native-intro library, optimized for AI coding agents to integrate tours and hints into React Native apps without hallucination.

## Overview

react-native-intro is a React Native library that provides:
- **Step-by-step tours** with spotlight overlay highlighting UI elements
- **Contextual hints** with pulsing indicators that reveal tooltips on tap
- **Accessibility** support for VoiceOver/TalkBack
- **Persistence** for "Don't show again" functionality

## Installation

```bash
# Required
npm install react-native-intro react-native-reanimated

# Optional (for "Don't show again" persistence)
npm install @react-native-async-storage/async-storage
```

### Babel Configuration

Add to `babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'], // Must be last
};
```

## Core Concepts

### 1. IntroProvider

**Required** - Wrap your app with `IntroProvider` to enable tours and hints:

```tsx
import { IntroProvider } from '@decaylabs/react-native-intro';

function App() {
  return (
    <IntroProvider>
      <YourApp />
    </IntroProvider>
  );
}
```

### 2. TourStep

Wrap elements to make them tour targets:

```tsx
import { TourStep } from '@decaylabs/react-native-intro';

<TourStep id="my-button" order={1} intro="Click here to start" title="Welcome">
  <Button title="Click Me" />
</TourStep>
```

### 3. HintSpot

Wrap elements to show hint indicators:

```tsx
import { HintSpot } from '@decaylabs/react-native-intro';

<HintSpot id="inbox" hint="New messages appear here" hintPosition="top-right">
  <InboxIcon />
</HintSpot>
```

### 4. Hooks

Use hooks to control tours and hints programmatically:

```tsx
import { useIntro, useTour, useHints } from '@decaylabs/react-native-intro';

const { tour, hints, callbacks } = useIntro();
// or
const tour = useTour();
const hints = useHints();
```

---

## Complete API Reference

### IntroProvider Props

```typescript
interface IntroProviderProps {
  children: React.ReactNode;

  // Theme: 'classic' | 'modern' | 'dark' | 'auto' | Theme object
  theme?: ThemeName | Theme;

  // Default options for all tours
  defaultTourOptions?: TourOptions;

  // Default options for all hints
  defaultHintOptions?: HintOptions;

  // Custom storage adapter for persistence
  storageAdapter?: StorageAdapter;

  // Disable "Don't show again" persistence
  disablePersistence?: boolean;
}
```

### TourStep Props

```typescript
interface TourStepProps {
  // Required: Unique identifier
  id: string;

  // Step order (lower = earlier). Default: 0
  order?: number;

  // Tooltip content (string or ReactNode)
  intro?: string | React.ReactNode;

  // Tooltip title
  title?: string;

  // Tooltip position relative to element
  // Values: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  position?: TooltipPosition;

  // Prevent user interaction with element during tour
  disableInteraction?: boolean;

  // Tour group identifier (for multiple tours)
  group?: string;

  // Hide navigation buttons for this step
  hideButtons?: boolean;

  // Custom tooltip styles
  tooltipStyle?: ViewStyle;
  tooltipTitleStyle?: TextStyle;
  tooltipTextStyle?: TextStyle;

  // Children to wrap (omit for floating tooltip - centered, no spotlight)
  children?: React.ReactNode;
}
```

### HintSpot Props

```typescript
interface HintSpotProps {
  // Required: Unique identifier
  id: string;

  // Hint tooltip content
  hint?: string | React.ReactNode;

  // Indicator position on the element
  // Values: 'top-left' | 'top-center' | 'top-right' |
  //         'middle-left' | 'middle-right' |
  //         'bottom-left' | 'bottom-center' | 'bottom-right'
  hintPosition?: HintPosition;

  // Enable pulsing animation. Default: true
  hintAnimation?: boolean;

  // Hint type for semantic styling
  // Values: 'default' | 'info' | 'warning' | 'error' | 'success'
  hintType?: HintType;

  // Custom indicator styles
  indicatorStyle?: ViewStyle;

  // Custom tooltip styles
  tooltipStyle?: ViewStyle;

  // Children to wrap
  children: React.ReactNode;
}
```

### Tour State (from useIntro/useTour)

```typescript
interface TourStateInfo {
  isActive: boolean;           // Tour is running
  tourId: string | null;       // Current tour ID
  currentStep: number;         // Current step index (0-based)
  totalSteps: number;          // Total steps count
  currentStepConfig: StepConfig | null;  // Current step config
  isTransitioning: boolean;    // Animating between steps
}
```

### Tour Controls (from useIntro/useTour)

```typescript
interface TourControls {
  // Start a tour
  // Patterns:
  //   start() - props-based, all TourStep components
  //   start(options) - props-based with options
  //   start('group') - props-based for specific group
  //   start('id', steps) - programmatic with explicit steps
  //   start('id', steps, options) - programmatic with options
  start: (
    tourIdOrOptions?: string | TourOptions,
    stepsOrOptions?: StepConfig[] | TourOptions,
    options?: TourOptions
  ) => void;

  next: () => void;                    // Go to next step
  prev: () => void;                    // Go to previous step
  goTo: (stepIndex: number) => void;   // Jump to step index
  stop: (reason?: 'completed' | 'skipped' | 'dismissed') => void;
  restart: () => void;                 // Restart from step 0
  isDismissed: (tourId: string) => boolean;
  clearDismissed: (tourId: string) => void;
  refresh: () => void;                 // Re-measure elements
}
```

### Hints State (from useIntro/useHints)

```typescript
interface HintsState {
  isVisible: boolean;          // Hints are showing
  activeHintId: string | null; // Currently open hint tooltip
  hints: HintConfig[];         // All hint configs
}
```

### Hints Controls (from useIntro/useHints)

```typescript
interface HintControls {
  // Show hints
  // Patterns:
  //   show() - props-based, all HintSpot components
  //   show(options) - props-based with options
  //   show(hints) - programmatic with explicit configs
  //   show(hints, options) - programmatic with options
  show: (
    hintsOrOptions?: HintConfig[] | HintOptions,
    options?: HintOptions
  ) => void;

  hide: () => void;                     // Hide all hints
  showHint: (hintId: string) => void;   // Show specific tooltip
  hideHint: (hintId: string) => void;   // Hide specific tooltip
  removeHint: (hintId: string) => void; // Remove hint entirely
  refresh: () => void;                  // Re-measure positions
}
```

### TourOptions

```typescript
interface TourOptions {
  showProgress?: boolean;        // Progress bar. Default: true
  showBullets?: boolean;         // Step dots. Default: true
  showButtons?: boolean;         // Nav buttons. Default: true
  exitOnOverlayClick?: boolean;  // Close on overlay tap. Default: false
  dontShowAgain?: boolean;       // Show checkbox. Default: false
  disableInteraction?: boolean;  // Block element touch. Default: false
  scrollToElement?: boolean;     // Auto-scroll. Default: true
  scrollPadding?: number | {     // Scroll padding. Default: 50
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  overlayOpacity?: number;       // 0-1. Default: 0.75
  overlayColor?: string;         // Overlay color
  animate?: boolean | 'auto';    // Animations. Default: 'auto'
  animationDuration?: number;    // Duration ms. Default: 300
  buttonLabels?: {
    next?: string;               // Default: 'Next'
    prev?: string;               // Default: 'Back'
    done?: string;               // Default: 'Done'
    skip?: string;               // Default: 'Skip'
    dontShowAgain?: string;      // Default: "Don't show again"
  };
  tooltipStyle?: ViewStyle;
  overlayStyle?: ViewStyle;
}
```

### HintOptions

```typescript
interface HintOptions {
  autoShow?: boolean;            // Show on render. Default: false
  animation?: boolean;           // Pulsing animation. Default: true
  closeOnOutsideClick?: boolean; // Close on outside tap. Default: true
  indicatorSize?: number;        // Indicator size. Default: 20
  indicatorStyle?: ViewStyle;
  tooltipStyle?: ViewStyle;
}
```

### StepConfig (for programmatic tours)

```typescript
interface StepConfig {
  id: string;                    // Unique step ID
  targetId?: string;             // Must match a TourStep's id (omit for floating)
  title?: string;                // Tooltip title
  content: string | ReactNode;   // Tooltip content
  position?: TooltipPosition;    // Tooltip position
  disableInteraction?: boolean;  // Block element touch
  hideButtons?: boolean;         // Hide nav buttons
  image?: {                      // Image in tooltip
    source: ImageSourcePropType;
    width?: number | string;
    height?: number;
    borderRadius?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    alt?: string;
    position?: 'top' | 'bottom';
  };
  tooltipStyle?: ViewStyle;
  tooltipTitleStyle?: TextStyle;
  tooltipTextStyle?: TextStyle;
}
```

### HintConfig (for programmatic hints)

```typescript
interface HintConfig {
  id: string;                    // Unique hint ID
  targetId: string;              // HintSpot component ID
  content: string | ReactNode;   // Tooltip content
  position?: HintPosition;       // Indicator position
  animation?: boolean;           // Pulsing animation
  type?: HintType;               // Semantic type
  indicatorStyle?: ViewStyle;
  tooltipStyle?: ViewStyle;
}
```

### TourCallbacks

```typescript
interface TourCallbacks {
  // Called before tour starts. Return false to prevent.
  onBeforeStart?: (tourId: string) => boolean | Promise<boolean>;

  // Called after tour starts
  onStart?: (tourId: string) => void;

  // Called before step change. Return false to prevent.
  onBeforeChange?: (
    currentStep: number,
    nextStep: number,
    direction: 'next' | 'prev' | 'goto'
  ) => boolean | Promise<boolean>;

  // Called after step change
  onChange?: (currentStep: number, previousStep: number) => void;

  // Called before tour exit. Return false to prevent.
  onBeforeExit?: (
    reason: 'completed' | 'skipped' | 'dismissed'
  ) => boolean | Promise<boolean>;

  // Called after tour ends
  onComplete?: (
    tourId: string,
    reason: 'completed' | 'skipped' | 'dismissed'
  ) => void;
}
```

### HintCallbacks

```typescript
interface HintCallbacks {
  onHintsShow?: () => void;
  onHintsHide?: () => void;
  onHintClick?: (hintId: string) => void;
  onHintClose?: (hintId: string) => void;
}
```

---

## Common Integration Patterns

### Pattern 1: Basic Props-Based Tour

```tsx
import { IntroProvider, TourStep, useTour } from '@decaylabs/react-native-intro';

function App() {
  return (
    <IntroProvider>
      <HomeScreen />
    </IntroProvider>
  );
}

function HomeScreen() {
  const tour = useTour();

  return (
    <View>
      <TourStep id="header" order={1} intro="Welcome to the app!" title="Hello">
        <Text>My App</Text>
      </TourStep>

      <TourStep id="button" order={2} intro="Tap here to continue">
        <Button title="Continue" onPress={() => {}} />
      </TourStep>

      <Button title="Start Tour" onPress={() => tour.start()} />
    </View>
  );
}
```

### Pattern 2: Programmatic Tour with Dynamic Content

```tsx
function DynamicTour() {
  const tour = useTour();
  const [features, setFeatures] = useState([]);

  const startTour = async () => {
    // Build steps dynamically
    const steps = features.map((feature, index) => ({
      id: `step-${index}`,
      targetId: `feature-${feature.id}`,
      title: feature.name,
      content: feature.description,
    }));

    tour.start('features-tour', steps);
  };

  return (
    <View>
      {features.map(feature => (
        <TourStep key={feature.id} id={`feature-${feature.id}`}>
          <FeatureCard feature={feature} />
        </TourStep>
      ))}
      <Button title="Start Tour" onPress={startTour} />
    </View>
  );
}
```

### Pattern 3: Tour with Async Validation

```tsx
function FormTour() {
  const { tour, callbacks } = useIntro();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    callbacks.setTourCallbacks({
      onBeforeChange: async (current, next, direction) => {
        // Validate before leaving step 1
        if (current === 0 && direction === 'next') {
          const isValid = await validateStep1(formData);
          if (!isValid) {
            Alert.alert('Please complete the form');
            return false;
          }
        }
        return true;
      },
      onBeforeExit: async (reason) => {
        if (reason !== 'completed') {
          return new Promise(resolve => {
            Alert.alert(
              'Exit Tour?',
              'Your progress will be lost.',
              [
                { text: 'Cancel', onPress: () => resolve(false) },
                { text: 'Exit', onPress: () => resolve(true) },
              ]
            );
          });
        }
        return true;
      },
    });
  }, [callbacks, formData]);

  return (
    <View>
      <TourStep id="form-field" order={1} intro="Enter your details">
        <TextInput value={formData.name} onChangeText={...} />
      </TourStep>
      <Button title="Start Tour" onPress={() => tour.start()} />
    </View>
  );
}
```

### Pattern 4: Floating Welcome Screen

```tsx
function WelcomeTour() {
  const tour = useTour();

  useEffect(() => {
    // Start with floating welcome, then highlight features
    tour.start('welcome', [
      {
        id: 'welcome',
        // No targetId = floating tooltip
        title: 'Welcome!',
        content: 'Let me show you around the app.',
      },
      {
        id: 'step-1',
        targetId: 'main-feature',
        content: 'This is the main feature.',
      },
    ]);
  }, []);

  return (
    <View>
      <TourStep id="main-feature">
        <MainFeature />
      </TourStep>
    </View>
  );
}
```

### Pattern 5: Hints with Types

```tsx
function FeatureHints() {
  const hints = useHints();

  return (
    <View>
      <HintSpot id="new" hint="New feature!" hintType="success" hintPosition="top-right">
        <NewFeatureButton />
      </HintSpot>

      <HintSpot id="warning" hint="Limited time offer" hintType="warning" hintPosition="bottom-center">
        <OfferBanner />
      </HintSpot>

      <Button title="Show Hints" onPress={() => hints.show()} />
      <Button title="Hide Hints" onPress={() => hints.hide()} />
    </View>
  );
}
```

### Pattern 6: Custom Theme

```tsx
import { IntroProvider, mergeTheme, classicTheme } from '@decaylabs/react-native-intro';

const customTheme = mergeTheme(classicTheme, {
  overlay: { opacity: 0.85 },
  tooltip: {
    backgroundColor: '#1a1a2e',
    titleColor: '#ffffff',
    contentColor: '#e0e0e0',
    borderRadius: 16,
  },
  buttons: {
    primary: {
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
    },
  },
});

function App() {
  return (
    <IntroProvider theme={customTheme}>
      <MyApp />
    </IntroProvider>
  );
}
```

### Pattern 7: Auto-Scroll in ScrollView

```tsx
import { useScrollView } from '@decaylabs/react-native-intro';

function LongScreen() {
  const { scrollViewRef, scrollViewProps } = useScrollView();
  const tour = useTour();

  return (
    <ScrollView ref={scrollViewRef} {...scrollViewProps}>
      <TourStep id="top" order={1} intro="Start here">
        <Text>Top section</Text>
      </TourStep>

      {/* ... lots of content ... */}

      <TourStep id="bottom" order={2} intro="Scroll happened automatically!">
        <Text>Bottom section</Text>
      </TourStep>

      <Button title="Start" onPress={() => tour.start()} />
    </ScrollView>
  );
}
```

### Pattern 8: Don't Show Again

```tsx
function OnboardingTour() {
  const tour = useTour();

  const handleStart = () => {
    if (tour.isDismissed('onboarding')) {
      // User previously checked "Don't show again"
      Alert.alert(
        'Show tour again?',
        'You previously dismissed this tour.',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => {
              tour.clearDismissed('onboarding');
              tour.start('onboarding', steps, { dontShowAgain: true });
            },
          },
        ]
      );
      return;
    }
    tour.start('onboarding', steps, { dontShowAgain: true });
  };

  return <Button title="Start Onboarding" onPress={handleStart} />;
}
```

### Pattern 9: Rich Tooltip Content

```tsx
tour.start('tutorial', [
  {
    id: 'step-1',
    targetId: 'feature',
    title: 'New Feature!',
    content: 'Check out this amazing feature.',
    image: {
      source: require('./feature.png'),
      height: 150,
      position: 'top',
    },
  },
  {
    id: 'step-2',
    targetId: 'custom',
    title: 'Interactive Content',
    content: (
      <View>
        <Text>Choose an option:</Text>
        <Button title="Option A" onPress={handleA} />
        <Button title="Option B" onPress={handleB} />
      </View>
    ),
    hideButtons: true, // Hide nav buttons for interactive content
  },
]);
```

---

## Exports Summary

### Components
- `IntroProvider` - Context provider (required)
- `TourStep` - Tour step wrapper
- `HintSpot` - Hint anchor wrapper
- `TourOverlay` - (internal) Overlay component
- `Tooltip` - (internal) Tooltip component
- `ProgressBar` - Progress bar component
- `StepBullets` - Step bullets component
- `HintBubble` - (internal) Hint bubble
- `HintIndicator` - (internal) Hint indicator

### Hooks
- `useIntro` - Combined tour + hints control
- `useTour` - Tour-only control
- `useHints` - Hints-only control
- `useScrollView` - ScrollView integration
- `useMeasure` - Element measurement
- `useReduceMotion` - Accessibility motion preference

### Theme Functions
- `classicTheme` - Light theme
- `modernTheme` - Contemporary theme
- `darkTheme` - Dark theme
- `themes` - Theme map
- `getTheme` - Get theme by name
- `mergeTheme` - Merge partial theme
- `createTheme` - Create from base theme
- `resolveTheme` - Resolve theme name/object
- `resolveThemeWithColorScheme` - Resolve with system color scheme

### Utilities
- `validateTour` - Validate tour config
- `validateStep` - Validate step config
- `validateHint` - Validate hint config
- `validateHints` - Validate hints array
- `calculateTooltipPosition` - Position calculation
- `announceForAccessibility` - A11y announcement
- `announceStepChange` - A11y step change
- `announceTourComplete` - A11y tour complete
- `announceHintRevealed` - A11y hint revealed
- `isReduceMotionEnabled` - Check motion preference
- `isScreenReaderEnabled` - Check screen reader

### Types (import type { ... })
- `TourOptions`, `HintOptions`
- `StepConfig`, `HintConfig`
- `TourState`, `TourStateInfo`, `TourControls`
- `HintsState`, `HintControls`
- `TourCallbacks`, `HintCallbacks`
- `TooltipPosition`, `HintPosition`, `HintType`
- `Theme`, `ThemeName`
- `IntroProviderProps`, `TourStepProps`, `HintSpotProps`
- `StorageAdapter`
- `UseIntroReturn`

---

## Platform Requirements

| Platform | Version |
|----------|---------|
| React Native | >= 0.81.0 |
| React | >= 19.0.0 |
| iOS | >= 15.1 |
| Android | API >= 24 |
| Expo | >= 54.0.0 (compatible, not required) |

## Key Behaviors

1. **Tour elements must be mounted** before starting a tour
2. **IDs must match exactly** between TourStep/HintSpot and step configs
3. **Floating steps** have no `targetId` - they render centered without spotlight
4. **Callbacks can be async** - return `Promise<boolean>` to pause navigation
5. **Measurements happen on start** - call `refresh()` after layout changes
6. **"Don't show again"** persists to AsyncStorage (if installed)
7. **Theme 'auto'** follows system dark/light mode

## Error Handling

- `"useIntro must be used within an IntroProvider"` - Wrap app in IntroProvider
- `"No steps found for tour"` - Add TourStep components or pass steps array
- `"Element not found"` warning - Ensure targetId matches TourStep id exactly
- Steps with `targetId` pointing to unmounted elements are skipped
