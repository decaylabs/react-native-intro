/**
 * BasicTourScreen - Demo screen showing basic tour functionality
 */

import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import {
  TourStep,
  useTour,
  useScrollView,
  type ScrollableRef,
} from 'react-native-intro';

export function BasicTourScreen() {
  const tour = useTour();
  // Use 'any' to work around complex RN 0.81 ScrollView typing
  const scrollRef = useRef<any>(null);

  // Animation toggle state
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Register ScrollView for auto-scrolling during tour
  const { onScroll } = useScrollView(
    scrollRef as React.RefObject<ScrollableRef | null>
  );

  // Handle Get Started button press
  const handleGetStarted = () => {
    if (tour.isActive) {
      tour.stop('completed');
    }
    setShowCompletionModal(true);
  };

  const startTour = () => {
    tour.start(
      'basic-tour',
      [
        {
          id: 'step-1',
          targetId: 'welcome-header',
          title: 'Welcome!',
          content:
            'This is a demo of the react-native-intro library. Let me show you around!',
        },
        {
          id: 'step-2',
          targetId: 'info-text',
          title: 'Auto-Scroll',
          content:
            'The tour automatically scrolls to bring off-screen elements into view. Pretty cool, right?',
        },
        {
          id: 'step-3',
          targetId: 'feature-1',
          title: 'Feature Highlight',
          content:
            'Each feature card can be highlighted with a spotlight effect and tooltip.',
        },
        {
          id: 'step-4',
          targetId: 'feature-2',
          title: 'Multiple Steps',
          content:
            'Tours can have multiple steps. Navigate with the Next and Back buttons.',
        },
        {
          id: 'step-5',
          targetId: 'action-button',
          title: 'Try It Out!',
          content:
            'Go ahead and tap the "Get Started" button below to complete the tour!',
          hideButtons: true,
        },
      ],
      {
        // Pass animation setting based on toggle
        animate: animationsEnabled,
        // Slower animations for dramatic effect
        animationDuration: 500,
      }
    );
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <TourStep id="welcome-header">
        <View style={styles.header}>
          <Text style={styles.title}>Basic Tour Demo</Text>
          <Text style={styles.subtitle}>
            Tap the button below to start the tour
          </Text>
        </View>
      </TourStep>

      {/* Animation Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Animations</Text>
        <Switch
          value={animationsEnabled}
          onValueChange={setAnimationsEnabled}
          trackColor={{ false: '#ccc', true: '#81b0ff' }}
          thumbColor={animationsEnabled ? '#007AFF' : '#f4f3f4'}
        />
        <Text style={styles.toggleStatus}>
          {animationsEnabled ? 'ON' : 'OFF'}
        </Text>
      </View>

      {/* Start Tour Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={startTour}
        disabled={tour.isActive}
      >
        <Text style={styles.startButtonText}>
          {tour.isActive ? 'Tour in progress...' : 'Start Tour'}
        </Text>
      </TouchableOpacity>

      {/* Tour Status */}
      {tour.isActive && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Step {tour.currentStep + 1} of {tour.totalSteps}
          </Text>
        </View>
      )}

      {/* Feature Cards */}
      <View style={styles.cardsContainer}>
        <TourStep id="feature-1">
          <View style={[styles.card, styles.cardBlue]}>
            <Text style={styles.cardTitle}>🚀 Fast Setup</Text>
            <Text style={styles.cardDescription}>
              Add guided tours to your app with minimal configuration.
            </Text>
          </View>
        </TourStep>

        <TourStep id="feature-2">
          <View style={[styles.card, styles.cardGreen]}>
            <Text style={styles.cardTitle}>🎨 Customizable</Text>
            <Text style={styles.cardDescription}>
              Customize colors, themes, and button labels to match your app.
            </Text>
          </View>
        </TourStep>

        <TourStep id="feature-3">
          <View style={[styles.card, styles.cardPurple]}>
            <Text style={styles.cardTitle}>📱 Native Feel</Text>
            <Text style={styles.cardDescription}>
              Built specifically for React Native with smooth animations.
            </Text>
          </View>
        </TourStep>
      </View>

      {/* Action Button */}
      <TourStep id="action-button">
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.actionButtonText}>Get Started</Text>
        </TouchableOpacity>
      </TourStep>

      {/* Additional info */}
      <TourStep id="info-text">
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            The tour highlights each TourStep component in sequence, showing a
            spotlight overlay and tooltip with navigation controls.
          </Text>
        </View>
      </TourStep>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Tour Complete!</Text>
            <Text style={styles.modalText}>
              You've successfully completed the onboarding tour. You're now
              ready to explore the app!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCompletionModal(false)}
            >
              <Text style={styles.modalButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    minWidth: 30,
  },
  startButton: {
    margin: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  cardsContainer: {
    padding: 20,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardBlue: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  cardGreen: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardPurple: {
    backgroundColor: '#F3E5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
