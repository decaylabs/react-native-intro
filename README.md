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

### Basic Tour (Props-based)

Wrap elements with `TourStep` and define step content via props:

```jsx
import { TourStep, useTour } from 'react-native-intro';

function HomeScreen() {
  const tour = useTour();

  return (
    <View>
      <TourStep id="welcome" order={1} intro="Welcome to the app!" title="Hello">
        <Text>My App</Text>
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

### Programmatic Tour

For dynamic tours or when content comes from a CMS:

```jsx
const tour = useTour();

const startTour = () => {
  tour.start('my-tour', [
    { id: 'step-1', targetId: 'welcome', content: 'Welcome!' },
    { id: 'step-2', targetId: 'profile', content: 'Your profile' },
  ]);
};
```

### TourStep Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | Unique identifier |
| `order` | `number` | `0` | Step order (lower = earlier) |
| `intro` | `string \| ReactNode` | — | Tooltip content |
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
const tour = useTour();

// Props-based (recommended)
tour.start();                         // Start default tour
tour.start({ showProgress: true });   // Start with options
tour.start('group-name');             // Start tour for specific group
tour.start('group', { exitOnOverlayClick: false }); // Group with options

// Programmatic (for dynamic content)
tour.start('id', steps);              // Start tour with explicit steps
tour.start('id', steps, options);     // With steps and options

// Navigation
tour.next();                // Go to next step
tour.prev();                // Go to previous step
tour.goTo(2);               // Go to specific step index
tour.stop();                // Stop the tour
tour.restart();             // Restart from beginning
tour.isDismissed('tour-id'); // Check if tour was dismissed
tour.clearDismissed('id');  // Clear dismissed state
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

### Basic Hints (Props-based)

Wrap elements with `HintSpot` and define hint content via props:

```jsx
import { HintSpot, useHints } from 'react-native-intro';

function Dashboard() {
  const hints = useHints();

  return (
    <View>
      <HintSpot id="inbox" hint="New messages appear here" hintPosition="bottom-right">
        <InboxIcon />
      </HintSpot>

      <HintSpot id="progress" hint="Track your daily progress" hintPosition="top-center" hintType="info">
        <ProgressChart />
      </HintSpot>

      <Button title="Show Hints" onPress={() => hints.show()} />
    </View>
  );
}
```

### Programmatic Hints

For dynamic hints or when content comes from a CMS:

```jsx
const hints = useHints();

hints.show([
  { id: 'hint-1', targetId: 'inbox', content: 'New messages!', type: 'info' },
  { id: 'hint-2', targetId: 'progress', content: 'Track progress', position: 'top-center' },
]);
```

### HintSpot Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | Unique identifier |
| `hint` | `string \| ReactNode` | — | Hint content |
| `hintPosition` | `HintPosition` | `'top-right'` | Indicator position |
| `hintAnimation` | `boolean` | `true` | Pulsing animation |
| `hintType` | `HintType` | `'default'` | Type: `default`, `info`, `warning`, `error`, `success` |

### Hint Positions

`top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`

### Hint Methods

```jsx
const hints = useHints();

// Props-based (recommended)
hints.show();                      // Show hints from HintSpot props
hints.show({ animation: false });  // With global options
hints.show({ closeOnOutsideClick: true }); // Options only

// Programmatic (for dynamic content)
hints.show(configs);               // Show hints with explicit config
hints.show(configs, options);      // With configs and options

// Control
hints.hide();               // Hide all hints
hints.showHint('hint-id');  // Show specific hint tooltip
hints.hideHint('hint-id');  // Hide specific hint tooltip
hints.removeHint('hint-id'); // Remove a hint entirely
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

Define steps without using TourStep props:

```jsx
const tour = useTour();

// Define steps programmatically
tour.start('my-tour', [
  { id: 'step-1', targetId: 'profile', content: 'Your profile', title: 'Profile' },
  { id: 'step-2', targetId: 'settings', content: 'Settings here' },
  { id: 'step-3', content: 'Welcome!', position: 'floating' }, // No element - floating tooltip
]);
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
