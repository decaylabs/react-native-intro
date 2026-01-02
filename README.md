# react-native-intro

A native React Native implementation of [intro.js](https://github.com/usablica/intro.js) — step-by-step user onboarding tours and contextual hints for mobile apps. This is not a wrapper around the web library; it's a complete reimplementation with feature parity to intro.js v8.0.0+.

## Installation

```bash
npm install react-native-intro
# or
yarn add react-native-intro
# or
pnpm add react-native-intro
```

### Optional Dependencies

```bash
# Enhanced animations
npm install react-native-reanimated

# "Don't show again" persistence
npm install @react-native-async-storage/async-storage
```

## Quick Start

Wrap your app with `IntroProvider`:

```jsx
import { IntroProvider } from 'react-native-intro';

export default function App() {
  return (
    <IntroProvider>
      <MyApp />
    </IntroProvider>
  );
}
```

## Tours

### Basic Tour

Wrap elements with `TourStep` and use the `useIntro` hook to control the tour:

```jsx
import { TourStep, useIntro } from 'react-native-intro';

function HomeScreen() {
  const intro = useIntro();

  return (
    <View>
      <TourStep step={1} intro="Welcome to the app!" title="Hello">
        <Text>My App</Text>
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
```

### TourStep Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `step` | `number` | required | Step order (1-indexed) |
| `intro` | `string \| ReactNode` | required | Tooltip content |
| `title` | `string` | — | Tooltip title |
| `position` | `TooltipPosition` | `'auto'` | Tooltip placement |
| `disableInteraction` | `boolean` | `false` | Prevent touch on element |
| `group` | `string` | — | Tour group identifier |

### Tooltip Positions

`top`, `top-left`, `top-middle`, `top-right`, `bottom`, `bottom-left`, `bottom-middle`, `bottom-right`, `left`, `right`, `auto`, `floating`

### Tour Options

Configure via `IntroProvider` or `intro.setOptions()`:

```jsx
<IntroProvider
  defaultOptions={{
    showProgress: true,
    showBullets: true,
    overlayOpacity: 0.7,
    exitOnOverlayClick: true,
    scrollToElement: true,
  }}
>
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `nextLabel` | `string` | `'Next'` | Next button text |
| `prevLabel` | `string` | `'Back'` | Previous button text |
| `skipLabel` | `string` | `'×'` | Skip button text |
| `doneLabel` | `string` | `'Done'` | Done button text |
| `showButtons` | `boolean` | `true` | Show navigation buttons |
| `showBullets` | `boolean` | `true` | Show step bullets |
| `showProgress` | `boolean` | `false` | Show progress bar |
| `showStepNumbers` | `boolean` | `false` | Show step numbers |
| `hidePrev` | `boolean` | `false` | Hide prev on first step |
| `hideNext` | `boolean` | `false` | Hide next on last step |
| `overlayOpacity` | `number` | `0.5` | Overlay opacity (0-1) |
| `exitOnOverlayClick` | `boolean` | `true` | Exit on overlay tap |
| `scrollToElement` | `boolean` | `true` | Auto-scroll to element |
| `scrollPadding` | `number` | `30` | Scroll padding (px) |
| `disableInteraction` | `boolean` | `false` | Disable element touch |
| `dontShowAgain` | `boolean` | `false` | Show opt-out checkbox |

### Tour Methods

```jsx
const intro = useIntro();

intro.start();              // Start tour
intro.start('onboarding');  // Start specific group
intro.exit();               // Exit tour
intro.nextStep();           // Go to next step
intro.previousStep();       // Go to previous step
intro.goToStep(3);          // Go to specific step
intro.isActive();           // Check if tour is active
intro.currentStep();        // Get current step number
intro.setDontShowAgain(true); // Set don't show again
```

### Tour Callbacks

```jsx
<IntroProvider
  onStart={() => console.log('Tour started')}
  onExit={() => console.log('Tour exited')}
  onComplete={() => console.log('Tour completed')}
  onChange={(step) => console.log(`Now on step ${step}`)}
  onBeforeChange={(step) => true} // Return false to prevent
  onBeforeExit={() => true}       // Return false to prevent
>
```

## Hints

### Basic Hints

Wrap elements with `HintSpot`:

```jsx
import { HintSpot, useIntro } from 'react-native-intro';

function Dashboard() {
  const intro = useIntro();

  useEffect(() => {
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
```

### HintSpot Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hint` | `string \| ReactNode` | required | Hint content |
| `hintPosition` | `HintPosition` | `'top-middle'` | Indicator position |
| `hintAnimation` | `boolean` | `true` | Pulsing animation |
| `hintButtonLabel` | `string` | `'Got it'` | Dismiss button text |
| `hintShowButton` | `boolean` | `true` | Show dismiss button |

### Hint Positions

`top-left`, `top-middle`, `top-right`, `middle-left`, `middle-middle`, `middle-right`, `bottom-left`, `bottom-middle`, `bottom-right`

### Hint Methods

```jsx
const intro = useIntro();

intro.showHints();          // Show all hints
intro.hideHints();          // Hide all hints
intro.showHint(0);          // Show specific hint
intro.hideHint(0);          // Hide specific hint
intro.showHintDialog(0);    // Show hint popup
```

### Hint Callbacks

```jsx
<IntroProvider
  onHintClick={(hintId) => console.log(`Hint ${hintId} clicked`)}
  onHintsAdded={() => console.log('Hints rendered')}
  onHintClose={(hintId) => console.log(`Hint ${hintId} closed`)}
>
```

## Theming

### Built-in Themes

```jsx
import { IntroProvider, themes } from 'react-native-intro';

<IntroProvider theme={themes.modern}>
  <App />
</IntroProvider>
```

Available: `default`, `modern`, `dark`, `nassau`, `royal`, `nazanin`

### Custom Theme

```jsx
<IntroProvider
  theme={{
    overlayColor: '#000',
    overlayOpacity: 0.75,
    tooltipBackgroundColor: '#fff',
    tooltipTextColor: '#333',
    buttonBackgroundColor: '#007bff',
    buttonTextColor: '#fff',
    highlightBorderColor: '#007bff',
    hintBackgroundColor: '#ff5722',
  }}
>
```

### RTL Support

```jsx
<IntroProvider rtl={true}>
  <App />
</IntroProvider>
```

## Programmatic Steps

Define steps without wrapping components:

```jsx
const intro = useIntro();

intro.addSteps([
  { element: profileRef, intro: 'Your profile', step: 1 },
  { element: settingsRef, intro: 'Settings here', step: 2 },
  { intro: 'Welcome!', position: 'floating' }, // No element
]);

intro.start();
```

## Platform Support

| Platform | Version |
|----------|---------|
| React Native | 0.81.0+ |
| React | 19.0.0+ |
| Expo | 54.0.0+ (optional) |
| iOS | 15.1+ |
| Android | API 24+ |

## TypeScript

Full TypeScript support included:

```tsx
import type { TourOptions, HintOptions, IntroTheme } from 'react-native-intro';
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) for development workflow and how to submit pull requests.

## License

MIT

## See Also

- [PROJECT_SPEC.md](./PROJECT_SPEC.md) - Full technical specification
- [intro.js documentation](https://introjs.com/docs)

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
