# react-native-intro

A native React Native implementation of [intro.js](https://github.com/usablica/intro.js) providing step-by-step user onboarding tours and contextual hints for mobile applications. This is not a wrapper around the web library; it's a complete reimplementation with feature parity to intro.js v8.0.0+.

## Table of Contents

- [Overview](#overview)
- [Goals](#goals)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Tour Feature Specification](#tour-feature-specification)
- [Hints Feature Specification](#hints-feature-specification)
- [API Reference](#api-reference)
- [Theming & Styling](#theming--styling)
- [Accessibility](#accessibility)
- [Platform Support](#platform-support)
- [Dependencies](#dependencies)
- [Development Roadmap](#development-roadmap)
- [Documentation References](#documentation-references)

---

## Overview

`react-native-intro` is a native React Native reimplementation of the popular intro.js onboarding library for mobile applications. It enables developers to create guided product tours and contextual hints that help users understand app features and navigation.

### Key Differentiators from Web intro.js

- **Native rendering**: Uses React Native components instead of DOM manipulation
- **Measure-based positioning**: Uses React Native's `measure()` API instead of CSS positioning
- **Touch-first interactions**: Optimized for mobile touch gestures
- **Cross-platform**: Single API for iOS and Android

---

## Goals

1. **Feature parity**: Support all intro.js tour and hint capabilities
2. **React Native idioms**: Follow React Native patterns and conventions
3. **Performance**: Smooth 60fps animations and minimal overhead
4. **Accessibility**: Full VoiceOver/TalkBack support
5. **Customization**: Extensive theming and styling options
6. **TypeScript**: Full type definitions included

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                    IntroProvider                         │
│  (Context provider wrapping app, manages tour state)    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  TourStep   │  │  TourStep   │  │    TourStep     │  │
│  │  (wrapper)  │  │  (wrapper)  │  │    (wrapper)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    Overlay Layer                         │
│  (Spotlight cutout, tooltip, navigation controls)       │
└─────────────────────────────────────────────────────────┘
```

### Core Modules

| Module | Purpose |
|--------|---------|
| `IntroProvider` | Context provider managing global tour/hint state |
| `TourStep` | HOC/wrapper component for tour step targets |
| `HintSpot` | Component for hint anchor points |
| `TourOverlay` | Full-screen overlay with spotlight cutout |
| `Tooltip` | Positioned tooltip with step content |
| `HintBubble` | Hint indicator and popup dialog |
| `useIntro` | Hook for programmatic tour/hint control |

---

## Core Components

### IntroProvider

Root provider component that must wrap the application.

```jsx
import { IntroProvider } from 'react-native-intro';

function App() {
  return (
    <IntroProvider>
      <MyApp />
    </IntroProvider>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Application content |
| `defaultOptions` | `IntroOptions` | `{}` | Default options for all tours/hints |

---

### TourStep

Wrapper component that registers an element as a tour step.

```jsx
import { TourStep } from 'react-native-intro';

<TourStep
  step={1}
  title="Welcome"
  intro="This is the main dashboard"
  position="bottom"
>
  <View style={styles.dashboard}>
    {/* content */}
  </View>
</TourStep>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `step` | `number` | — | Step order (1-indexed) |
| `intro` | `string \| ReactNode` | — | Tooltip content |
| `title` | `string` | `undefined` | Tooltip title |
| `position` | `TooltipPosition` | `'auto'` | Tooltip placement |
| `tooltipClass` | `string` | `''` | Custom style key |
| `highlightClass` | `string` | `''` | Custom highlight style key |
| `scrollTo` | `'element' \| 'tooltip' \| 'off'` | `'element'` | Scroll behavior |
| `disableInteraction` | `boolean` | `false` | Prevent touch on element |
| `group` | `string` | `undefined` | Tour group identifier |
| `children` | `ReactNode` | — | Target element |

---

### HintSpot

Component that registers a hint anchor point.

```jsx
import { HintSpot } from 'react-native-intro';

<HintSpot
  hint="Tap here to access settings"
  hintPosition="top-right"
>
  <TouchableOpacity onPress={openSettings}>
    <Icon name="settings" />
  </TouchableOpacity>
</HintSpot>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hint` | `string \| ReactNode` | — | Hint content |
| `hintPosition` | `HintPosition` | `'top-middle'` | Hint indicator position |
| `hintAnimation` | `boolean` | `true` | Pulsing animation |
| `hintButtonLabel` | `string` | `'Got it'` | Dismiss button text |
| `hintShowButton` | `boolean` | `true` | Show dismiss button |
| `children` | `ReactNode` | — | Target element |

---

## Tour Feature Specification

### Tour Options

Full configuration options matching intro.js:

```typescript
interface TourOptions {
  // Activation
  isActive?: boolean;                    // Default: true

  // Steps
  steps?: TourStepConfig[];              // Programmatic step definition
  group?: string;                        // Filter steps by group

  // Labels
  nextLabel?: string;                    // Default: 'Next'
  prevLabel?: string;                    // Default: 'Back'
  skipLabel?: string;                    // Default: '×'
  doneLabel?: string;                    // Default: 'Done'

  // Button Visibility
  hidePrev?: boolean;                    // Default: false
  hideNext?: boolean;                    // Default: false
  nextToDone?: boolean;                  // Default: true
  showButtons?: boolean;                 // Default: true
  showBullets?: boolean;                 // Default: true
  showProgress?: boolean;                // Default: false
  showStepNumbers?: boolean;             // Default: false

  // Positioning
  tooltipPosition?: TooltipPosition;     // Default: 'bottom'
  autoPosition?: boolean;                // Default: true

  // Styling
  tooltipClass?: string;                 // Default: ''
  highlightClass?: string;               // Default: ''
  overlayOpacity?: number;               // Default: 0.5

  // Behavior
  exitOnOverlayClick?: boolean;          // Default: true
  exitOnEsc?: boolean;                   // Default: true (hardware back on Android)
  keyboardNavigation?: boolean;          // Default: true
  disableInteraction?: boolean;          // Default: false

  // Scrolling
  scrollToElement?: boolean;             // Default: true
  scrollPadding?: number;                // Default: 30

  // Don't Show Again
  dontShowAgain?: boolean;               // Default: false
  dontShowAgainLabel?: string;           // Default: "Don't show this again"
  dontShowAgainCookie?: string;          // Storage key for preference
}
```

### Tour Step Configuration

```typescript
interface TourStepConfig {
  element?: string | React.RefObject;    // Target element ref or accessibility id
  step?: number;                         // Step order
  intro: string | React.ReactNode;       // Tooltip content
  title?: string;                        // Tooltip title
  position?: TooltipPosition;            // Override default position
  tooltipClass?: string;                 // Step-specific tooltip style
  highlightClass?: string;               // Step-specific highlight style
  scrollTo?: 'element' | 'tooltip' | 'off';
  disableInteraction?: boolean;
}
```

### Tooltip Positions

```typescript
type TooltipPosition =
  | 'top'
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-middle'
  | 'bottom-right'
  | 'left'
  | 'right'
  | 'auto'
  | 'floating';                          // Centered, no element highlight
```

### Tour Callbacks

```typescript
interface TourCallbacks {
  onStart?: () => void;
  onExit?: () => void;
  onBeforeExit?: () => boolean | Promise<boolean>;  // Return false to prevent
  onComplete?: () => void;
  onChange?: (step: number, element: StepElement) => void;
  onBeforeChange?: (step: number, element: StepElement) => boolean | Promise<boolean>;
  onAfterChange?: (step: number, element: StepElement) => void;
}
```

### Tour Methods (via useIntro hook)

```typescript
interface TourMethods {
  // Lifecycle
  start(group?: string): void;
  exit(force?: boolean): void;
  refresh(): void;

  // Navigation
  nextStep(): void;
  previousStep(): void;
  goToStep(step: number): void;

  // State
  isActive(): boolean;
  currentStep(): number | null;
  totalSteps(): number;

  // Configuration
  setOption<K extends keyof TourOptions>(key: K, value: TourOptions[K]): void;
  setOptions(options: Partial<TourOptions>): void;

  // Steps
  addStep(step: TourStepConfig): void;
  addSteps(steps: TourStepConfig[]): void;

  // Don't Show Again
  setDontShowAgain(value: boolean): void;
  getDontShowAgain(): boolean;
}
```

---

## Hints Feature Specification

### Hint Options

```typescript
interface HintOptions {
  hints?: HintConfig[];                  // Programmatic hint definition
  hintPosition?: HintPosition;           // Default: 'top-middle'
  hintButtonLabel?: string;              // Default: 'Got it'
  hintShowButton?: boolean;              // Default: true
  hintAnimation?: boolean;               // Default: true
  hintAutoRefreshInterval?: number;      // Default: 10 (ms), -1 to disable
}
```

### Hint Configuration

```typescript
interface HintConfig {
  element?: string | React.RefObject;    // Target element
  hint: string | React.ReactNode;        // Hint content
  hintPosition?: HintPosition;           // Override default position
  hintAnimation?: boolean;               // Override default animation
}
```

### Hint Positions

```typescript
type HintPosition =
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'middle-left'
  | 'middle-middle'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-middle'
  | 'bottom-right';
```

### Hint Callbacks

```typescript
interface HintCallbacks {
  onHintClick?: (hintId: number) => void;
  onHintsAdded?: () => void;
  onHintClose?: (hintId: number) => void;
}
```

### Hint Methods (via useIntro hook)

```typescript
interface HintMethods {
  // Display
  addHints(): void;
  showHints(): void;
  hideHints(): void;

  // Individual Hints
  showHint(hintId: number): void;
  hideHint(hintId: number): void;
  showHintDialog(hintId: number): void;

  // Configuration
  enableHints(): void;
  disableHints(): void;
  refresh(): void;
}
```

---

## API Reference

### useIntro Hook

Primary hook for programmatic control:

```typescript
import { useIntro } from 'react-native-intro';

function MyComponent() {
  const intro = useIntro();

  const startOnboarding = () => {
    intro.setOptions({
      showProgress: true,
      overlayOpacity: 0.7,
    });
    intro.start();
  };

  return (
    <Button onPress={startOnboarding} title="Start Tour" />
  );
}
```

### Imperative API

For use outside React components:

```typescript
import IntroJs from 'react-native-intro';

// Start tour
IntroJs.tour().start();

// With options
IntroJs.tour()
  .setOptions({ showProgress: true })
  .onComplete(() => console.log('Done!'))
  .start();

// Hints
IntroJs.hints().showHints();
```

---

## Theming & Styling

### Built-in Themes

| Theme | Description |
|-------|-------------|
| `default` | Standard intro.js appearance |
| `modern` | Clean, minimal design |
| `dark` | Dark mode optimized |
| `nassau` | intro.js Nassau theme |
| `royal` | intro.js Royal theme |
| `nazanin` | intro.js Nazanin theme |

### Theme Usage

```jsx
import { IntroProvider, themes } from 'react-native-intro';

<IntroProvider theme={themes.modern}>
  <App />
</IntroProvider>
```

### Custom Themes

```typescript
interface IntroTheme {
  // Overlay
  overlayColor: string;
  overlayOpacity: number;

  // Tooltip
  tooltipBackgroundColor: string;
  tooltipTextColor: string;
  tooltipBorderRadius: number;
  tooltipPadding: number;
  tooltipShadow: ShadowStyleIOS & { elevation: number };

  // Title
  titleFontSize: number;
  titleFontWeight: TextStyle['fontWeight'];
  titleColor: string;

  // Content
  contentFontSize: number;
  contentLineHeight: number;

  // Buttons
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonBorderRadius: number;
  buttonPadding: { horizontal: number; vertical: number };

  // Skip Button
  skipButtonColor: string;

  // Progress
  progressBackgroundColor: string;
  progressFillColor: string;
  progressHeight: number;

  // Bullets
  bulletColor: string;
  bulletActiveColor: string;
  bulletSize: number;

  // Highlight
  highlightBorderColor: string;
  highlightBorderWidth: number;
  highlightPadding: number;

  // Hints
  hintBackgroundColor: string;
  hintPulseColor: string;
  hintSize: number;
}
```

### RTL Support

```jsx
<IntroProvider rtl={true}>
  <App />
</IntroProvider>
```

---

## Accessibility

### VoiceOver / TalkBack Support

- All tour elements are announced with proper labels
- Navigation buttons have accessibility hints
- Step progress is announced ("Step 2 of 5")
- Focus management during tour navigation

### Accessibility Props

```typescript
interface AccessibilityOptions {
  accessibilityAnnounceStepChange?: boolean;  // Default: true
  accessibilityNextHint?: string;
  accessibilityPrevHint?: string;
  accessibilitySkipHint?: string;
  accessibilityDoneHint?: string;
}
```

### Reduced Motion

```typescript
// Respects system reduced motion settings
import { useReducedMotion } from 'react-native-intro';

const prefersReducedMotion = useReducedMotion();
```

---

## Platform Support

| Platform | Minimum Version |
|----------|-----------------|
| React Native | 0.81.0+ |
| React | 19.0.0+ |
| Expo | 54.0.0+ (optional) |
| iOS | 15.1+ |
| Android | API 24 (7.0)+ |
| React Native New Architecture | Supported |

### Platform-Specific Behavior

| Feature | iOS | Android |
|---------|-----|---------|
| Exit on back press | N/A | Configurable via `exitOnEsc` |
| Hardware keyboard nav | Supported | Supported |
| Overlay blur | Native blur | Opacity fallback |
| Animations | Native driver | Native driver |

---

## Dependencies

### Required Peer Dependencies

```json
{
  "react": ">=19.0.0",
  "react-native": ">=0.81.0"
}
```

### Optional Peer Dependencies

```json
{
  "expo": ">=54.0.0"
}
```

### Optional Dependencies

```json
{
  "react-native-reanimated": ">=3.0.0",
  "@react-native-async-storage/async-storage": ">=1.0.0"
}
```

- **react-native-reanimated**: Enhanced animations (falls back to Animated API)
- **async-storage**: "Don't show again" persistence (falls back to in-memory)

### Feature Parity Target

This library implements feature parity with **intro.js v8.0.0+**. Note: intro.js itself is not a dependency - this is a native React Native reimplementation of its API and behavior.

---

## Project Structure

```
react-native-intro/
├── src/                    # Library source (TypeScript)
│   ├── index.tsx           # Main exports
│   ├── IntroProvider.tsx
│   ├── TourStep.tsx
│   ├── HintSpot.tsx
│   └── __tests__/          # Unit tests
├── lib/                    # Built output (gitignored)
│   ├── module/             # ESM build
│   └── typescript/         # Type definitions
├── example/                # Expo example app
│   ├── src/
│   ├── app.json
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml          # Lint, test, build
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── lefthook.yml            # Git hooks
```

---

## Development Tooling

| Tool | Purpose | Command |
|------|---------|---------|
| **react-native-builder-bob** | Build library | `yarn prepare` |
| **TypeScript** | Type checking | `yarn typecheck` |
| **ESLint + Prettier** | Linting | `yarn lint` |
| **Jest** | Unit tests | `yarn test` |
| **Lefthook** | Git hooks | Auto on commit |
| **Commitlint** | Commit messages | Conventional commits |
| **release-it** | Releases | `yarn release` |

---

## Development Roadmap

### Phase 1: Core Foundation
- [ ] IntroProvider context setup
- [ ] TourStep component with ref measurement
- [ ] Basic overlay with spotlight cutout
- [ ] Tooltip positioning engine
- [ ] Navigation controls (next/prev/skip/done)

### Phase 2: Full Tour Support
- [ ] All tooltip positions
- [ ] Auto-positioning logic
- [ ] Scroll-to-element behavior
- [ ] Keyboard/hardware back navigation
- [ ] Step groups filtering
- [ ] All callbacks implementation
- [ ] Progress bar and bullets

### Phase 3: Hints System
- [ ] HintSpot component
- [ ] Hint bubble with pulse animation
- [ ] Hint dialog popup
- [ ] Hint show/hide controls
- [ ] Hint callbacks

### Phase 4: Polish & Extras
- [ ] Built-in themes
- [ ] RTL support
- [ ] Custom theme API
- [ ] "Don't show again" with persistence
- [ ] Accessibility audit and fixes
- [ ] TypeScript strict mode compliance
- [ ] Performance optimization

### Phase 5: Documentation & Release
- [ ] API documentation
- [ ] Usage examples
- [ ] Example app
- [x] CI/CD setup
- [ ] npm publish

---

## Documentation Reference

https://github.com/usablica/intro.js
https://introjs.com/docs

Getting started docs:
https://introjs.com/docs/getting-started/install
https://introjs.com/docs/getting-started/start

Tour docs:
https://introjs.com/docs/tour/examples/async-await
https://introjs.com/docs/tour/examples/confirm-before-exit
https://introjs.com/docs/tour/examples/css-class
https://introjs.com/docs/tour/examples/disable-interaction
https://introjs.com/docs/tour/examples/dont-show-again
https://introjs.com/docs/tour/examples/floating-tooltip
https://introjs.com/docs/tour/examples/html-tooltip
https://introjs.com/docs/tour/examples/json-config
https://introjs.com/docs/tour/examples/progress-bar
https://introjs.com/docs/tour/examples/rtl
https://introjs.com/docs/tour/examples/scrollable-element
https://introjs.com/docs/tour/examples/tooltip-positions
https://introjs.com/docs/tour/examples/svg
https://introjs.com/docs/tour/examples/hello-world
https://introjs.com/docs/tour/examples/without-bullets
https://introjs.com/docs/tour/examples/without-buttons

Hints docs:
https://introjs.com/docs/hints/examples/hello-world
https://introjs.com/docs/api/classes/packages_hint_hint.Hint.html
https://introjs.com/docs/api/modules/packages_hint_dataAttributes.html
https://introjs.com/docs/api/interfaces/packages_hint_option.HintOptions.html

Themes docs:
https://introjs.com/docs/themes/install
https://introjs.com/docs/themes/list

---

## Example Usage

### Basic Tour

```jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { IntroProvider, TourStep, useIntro } from 'react-native-intro';

function HomeScreen() {
  const intro = useIntro();

  return (
    <View>
      <TourStep step={1} intro="Welcome to the app!" title="Hello">
        <Text style={styles.title}>My App</Text>
      </TourStep>

      <TourStep step={2} intro="Tap here to view your profile">
        <Button title="Profile" onPress={() => {}} />
      </TourStep>

      <TourStep step={3} intro="Access settings here" position="left">
        <Button title="Settings" onPress={() => {}} />
      </TourStep>

      <Button title="Start Tour" onPress={() => intro.start()} />
    </View>
  );
}

export default function App() {
  return (
    <IntroProvider
      defaultOptions={{
        showProgress: true,
        overlayOpacity: 0.7,
      }}
      onComplete={() => console.log('Tour completed!')}
    >
      <HomeScreen />
    </IntroProvider>
  );
}
```

### Hints Example

```jsx
import React from 'react';
import { View } from 'react-native';
import { IntroProvider, HintSpot, useIntro } from 'react-native-intro';

function Dashboard() {
  const intro = useIntro();

  React.useEffect(() => {
    intro.showHints();
  }, []);

  return (
    <View>
      <HintSpot hint="New messages appear here" hintPosition="bottom-right">
        <InboxIcon />
      </HintSpot>

      <HintSpot hint="Track your daily progress" hintPosition="top-middle">
        <ProgressChart />
      </HintSpot>
    </View>
  );
}

export default function App() {
  return (
    <IntroProvider>
      <Dashboard />
    </IntroProvider>
  );
}
```

---

## License

MIT License

---

## Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.
