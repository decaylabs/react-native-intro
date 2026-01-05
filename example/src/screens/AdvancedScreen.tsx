import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import {
  TourStep,
  useIntro,
  useScrollView,
  setDebugEnabled,
  type ScrollableRef,
} from '@decaylabs/react-native-intro';
import { DemoCard } from '../components/DemoCard';

interface AdvancedScreenProps {
  isDark: boolean;
}

const Colors = {
  light: {
    background: '#f5f5f5',
    text: '#333333',
    textSecondary: '#666666',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
  },
  dark: {
    background: '#121212',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    success: '#69F0AE',
    warning: '#FFB74D',
    info: '#64B5F6',
  },
};

export function AdvancedScreen({ isDark }: AdvancedScreenProps) {
  const { tour, callbacks } = useIntro();

  const scrollViewRef = useRef<any>(null);
  const { onScroll } = useScrollView(
    scrollViewRef as React.RefObject<ScrollableRef | null>
  );
  const colors = isDark ? Colors.dark : Colors.light;

  // Track callback events
  const [events, setEvents] = useState<string[]>([]);
  const [confirmOnExit, setConfirmOnExit] = useState(true);
  const [asyncDelay, setAsyncDelay] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  // Force re-render to update dismissed status display
  const [, forceUpdate] = useState(0);

  // Handle debug mode toggle
  const handleDebugToggle = useCallback((enabled: boolean) => {
    setDebugMode(enabled);
    setDebugEnabled(enabled);
  }, []);

  const addEvent = useCallback((event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [`[${timestamp}] ${event}`, ...prev].slice(0, 10));
  }, []);

  // Set up callbacks
  useEffect(() => {
    callbacks.setTourCallbacks({
      onBeforeStart: async (tourId) => {
        addEvent(`onBeforeStart: ${tourId}`);
        if (asyncDelay) {
          // Simulate async check (e.g., fetching user preferences)
          await new Promise((resolve) => setTimeout(resolve, 500));
          addEvent('Async check completed');
        }
        return true;
      },
      onStart: (tourId) => {
        addEvent(`onStart: ${tourId}`);
      },
      onBeforeChange: async (current, next, direction) => {
        addEvent(`onBeforeChange: ${current} → ${next} (${direction})`);
        if (asyncDelay) {
          // Simulate async validation (e.g., saving progress)
          await new Promise((resolve) => setTimeout(resolve, 300));
          addEvent('Async validation passed');
        }
        return true;
      },
      onChange: (newStep, oldStep) => {
        addEvent(`onChange: ${oldStep} → ${newStep}`);
      },
      onBeforeExit: async (reason) => {
        addEvent(`onBeforeExit: ${reason}`);
        if (confirmOnExit && reason === 'skipped') {
          return new Promise((resolve) => {
            Alert.alert(
              'Skip Tour?',
              'Are you sure you want to skip this tour?',
              [
                { text: 'Cancel', onPress: () => resolve(false) },
                {
                  text: 'Skip',
                  onPress: () => resolve(true),
                  style: 'destructive',
                },
              ]
            );
          });
        }
        return true;
      },
      onComplete: (tourId, reason) => {
        addEvent(`onComplete: ${tourId} (${reason})`);
      },
    });

    return () => {
      // Clear callbacks on unmount
      callbacks.setTourCallbacks({});
    };
  }, [callbacks, addEvent, confirmOnExit, asyncDelay]);

  const startAsyncTour = () => {
    setEvents([]);
    tour.start(
      'async-demo',
      [
        {
          id: 'step-1',
          targetId: 'async-card',
          title: 'Async Callbacks',
          content:
            'This tour demonstrates async callbacks. Watch the event log below!',
          disableInteraction: true, // Prevent button clicks during tour
        },
        {
          id: 'step-2',
          targetId: 'confirm-card',
          title: 'Confirm on Exit',
          content: 'Try clicking Skip to see the confirmation dialog.',
        },
        {
          id: 'step-3',
          targetId: 'event-log',
          title: 'Event Log',
          content: 'All callback events are logged here in real-time.',
        },
      ],
      { scrollToElement: true }
    );
  };

  const startProgrammaticTour = () => {
    setEvents([]);
    tour.start(
      'programmatic-demo',
      [
        {
          id: 'step-1',
          targetId: 'nav-card',
          title: 'Programmatic Control',
          content: 'You can control the tour programmatically using the hook.',
          disableInteraction: true, // Prevent button clicks during tour
        },
        {
          id: 'step-2',
          targetId: 'async-card',
          title: 'Navigation Methods',
          content: 'Use tour.next(), tour.prev(), tour.goTo(n), tour.stop()',
        },
        {
          id: 'step-3',
          targetId: 'event-log',
          title: 'State Access',
          content: 'Access tour.isActive, tour.currentStep, tour.totalSteps',
        },
      ],
      { scrollToElement: true }
    );
  };

  const PERSISTENCE_TOUR_ID = 'persistence-demo';

  const startPersistenceTour = () => {
    // Check if already dismissed
    if (tour.isDismissed(PERSISTENCE_TOUR_ID)) {
      Alert.alert(
        'Tour Dismissed',
        'This tour was previously dismissed. Would you like to reset it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset & Start',
            onPress: () => {
              tour.clearDismissed(PERSISTENCE_TOUR_ID);
              forceUpdate((n) => n + 1);
              // Small delay to ensure state is cleared
              setTimeout(() => {
                tour.start(
                  PERSISTENCE_TOUR_ID,
                  [
                    {
                      id: 'step-1',
                      targetId: 'persistence-card',
                      title: 'Persistence Demo',
                      content:
                        'Check the "Don\'t show again" box below, then complete the tour.',
                    },
                    {
                      id: 'step-2',
                      targetId: 'event-log',
                      title: 'Check the Status',
                      content:
                        "After dismissing, the status will update and the tour won't start again.",
                    },
                  ],
                  { dontShowAgain: true, scrollToElement: true }
                );
              }, 100);
            },
          },
        ]
      );
      return;
    }

    tour.start(
      PERSISTENCE_TOUR_ID,
      [
        {
          id: 'step-1',
          targetId: 'persistence-card',
          title: 'Persistence Demo',
          content:
            'Check the "Don\'t show again" box below, then complete the tour.',
        },
        {
          id: 'step-2',
          targetId: 'event-log',
          title: 'Check the Status',
          content:
            "After dismissing, the status will update and the tour won't start again.",
        },
      ],
      { dontShowAgain: true, scrollToElement: true }
    );
  };

  const resetDismissed = () => {
    tour.clearDismissed(PERSISTENCE_TOUR_ID);
    forceUpdate((n) => n + 1);
    addEvent(`Cleared dismissed state for ${PERSISTENCE_TOUR_ID}`);
  };

  const isPersistenceDismissed = tour.isDismissed(PERSISTENCE_TOUR_ID);

  return (
    <ScrollView
      ref={scrollViewRef}
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Advanced Features
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Async callbacks, confirmation dialogs, and programmatic control
      </Text>

      {/* Debug Mode Toggle */}
      <DemoCard
        title="Debug Logging"
        description="Enable detailed console logging to debug tour positioning and state changes."
        isDark={isDark}
      >
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Enable debug logs
          </Text>
          <Switch
            value={debugMode}
            onValueChange={handleDebugToggle}
            trackColor={{ true: colors.success }}
          />
        </View>
        {debugMode && (
          <Text style={[styles.debugHint, { color: colors.success }]}>
            Check Metro console for [TourOverlay], [Tooltip], [Positioning] logs
          </Text>
        )}
      </DemoCard>

      {/* Async Callbacks Demo */}
      <TourStep id="async-card" order={1}>
        <DemoCard
          title="Async Callbacks"
          description="Callbacks can be async functions. The tour will wait for them to resolve before proceeding."
          buttonLabel="Start Async Tour"
          onPress={startAsyncTour}
          isDark={isDark}
        >
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Simulate async delay
            </Text>
            <Switch
              value={asyncDelay}
              onValueChange={setAsyncDelay}
              trackColor={{ true: colors.info }}
            />
          </View>
        </DemoCard>
      </TourStep>

      {/* Confirm on Exit Demo */}
      <TourStep id="confirm-card" order={2}>
        <DemoCard
          title="Confirm Before Exit"
          description="Use onBeforeExit to show a confirmation dialog when the user tries to skip or close the tour."
          isDark={isDark}
        >
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Confirm on skip
            </Text>
            <Switch
              value={confirmOnExit}
              onValueChange={setConfirmOnExit}
              trackColor={{ true: colors.warning }}
            />
          </View>
        </DemoCard>
      </TourStep>

      {/* Programmatic Control Demo */}
      <TourStep id="nav-card" order={3}>
        <DemoCard
          title="Programmatic Control"
          description="Control the tour with code: navigate, stop, restart, and check state."
          buttonLabel="Start Programmatic Tour"
          onPress={startProgrammaticTour}
          isDark={isDark}
        >
          {tour.isActive && (
            <View style={styles.controlRow}>
              <Text style={[styles.stepInfo, { color: colors.info }]}>
                Step {tour.currentStep + 1} of {tour.totalSteps}
              </Text>
            </View>
          )}
        </DemoCard>
      </TourStep>

      {/* Event Log */}
      <TourStep id="event-log" order={4}>
        <DemoCard
          title="Callback Event Log"
          description="Real-time log of callback events from the current tour."
          isDark={isDark}
        >
          <ScrollView
            style={[
              styles.eventLog,
              { backgroundColor: isDark ? '#2c2c2e' : '#f8f8f8' },
            ]}
            nestedScrollEnabled
          >
            {events.length === 0 ? (
              <Text style={[styles.eventText, { color: colors.textSecondary }]}>
                Start a tour to see events...
              </Text>
            ) : (
              events.map((event, index) => (
                <Text
                  key={index}
                  style={[styles.eventText, { color: colors.text }]}
                >
                  {event}
                </Text>
              ))
            )}
          </ScrollView>
        </DemoCard>
      </TourStep>

      {/* Persistence Demo */}
      <TourStep id="persistence-card" order={5}>
        <DemoCard
          title="Don't Show Again"
          description="Enable the dontShowAgain option to let users permanently dismiss tours. The state persists across app restarts."
          buttonLabel="Start Persistence Tour"
          onPress={startPersistenceTour}
          isDark={isDark}
        >
          <View style={styles.persistenceStatus}>
            <Text style={[styles.statusLabel, { color: colors.text }]}>
              Tour Status:
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isPersistenceDismissed
                    ? colors.warning
                    : colors.success,
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {isPersistenceDismissed ? 'DISMISSED' : 'ACTIVE'}
              </Text>
            </View>
          </View>
          {isPersistenceDismissed && (
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.warning }]}
              onPress={resetDismissed}
            >
              <Text style={[styles.resetButtonText, { color: colors.warning }]}>
                Reset Dismissed State
              </Text>
            </TouchableOpacity>
          )}
        </DemoCard>
      </TourStep>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 15,
  },
  controlRow: {
    paddingVertical: 8,
  },
  stepInfo: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventLog: {
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    maxHeight: 200,
  },
  eventText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  infoBox: {
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  persistenceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  debugHint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
