/**
 * BasicTourScreen - Demo screen showing basic tour functionality
 *
 * Demonstrates props-based tour configuration where step content
 * is defined on TourStep components and global options are passed
 * to tour.start().
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  IntroProvider,
  TourStep,
  useTour,
  useScrollView,
  type ScrollableRef,
} from '@decaylabs/react-native-intro';

interface BasicTourScreenProps {
  isDark?: boolean;
}

/**
 * Modal Demo Content - Separate component with its own IntroProvider
 * This demonstrates how to show tours ON modal screens.
 */
interface ModalDemoContentProps {
  isDark: boolean;
  animationsEnabled: boolean;
  onClose: () => void;
}

function ModalDemoContent({
  isDark,
  animationsEnabled,
  onClose,
}: ModalDemoContentProps) {
  const colors = isDark ? Colors.dark : Colors.light;
  const tour = useTour();

  // Auto-start tour when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      tour.start({
        animate: animationsEnabled,
        animationDuration: 500,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [tour, animationsEnabled]);

  const handleClose = useCallback(() => {
    if (tour.isActive) {
      tour.stop('dismissed');
    }
    onClose();
  }, [tour, onClose]);

  return (
    <SafeAreaView
      style={[
        styles.modalDemoContainer,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Header with close button */}
      <View
        style={[
          styles.modalDemoHeader,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TourStep
          id="modal-header"
          order={1}
          title="Modal Tour Works!"
          intro="This tour is running inside a native modal with its own IntroProvider. The overlay renders correctly above the modal content!"
        >
          <View style={styles.modalDemoHeaderContent}>
            <Text style={[styles.modalDemoTitle, { color: colors.text }]}>
              Modal Demo
            </Text>
          </View>
        </TourStep>
        <TouchableOpacity style={styles.modalCloseButton} onPress={handleClose}>
          <Text style={[styles.modalCloseText, { color: colors.accent }]}>
            Close
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal content */}
      <ScrollView style={styles.modalDemoContent}>
        <TourStep
          id="modal-feature"
          order={2}
          title="Feature Spotlight"
          intro="Elements inside modals can be highlighted just like regular screen content."
        >
          <View
            style={[
              styles.modalDemoCard,
              {
                backgroundColor: colors.cardBlue.bg,
                borderLeftColor: colors.cardBlue.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Native Modal Support
            </Text>
            <Text
              style={[styles.cardDescription, { color: colors.textSecondary }]}
            >
              Tours now work seamlessly with React Navigation modals and other
              native presentations.
            </Text>
          </View>
        </TourStep>

        <TourStep
          id="modal-action"
          order={3}
          title="All Done!"
          intro="Wrap your modal content with IntroProvider to enable tours inside modals!"
        >
          <TouchableOpacity
            style={[styles.actionButton, { marginTop: 16 }]}
            onPress={handleClose}
          >
            <Text style={styles.actionButtonText}>Complete Demo</Text>
          </TouchableOpacity>
        </TourStep>
      </ScrollView>
    </SafeAreaView>
  );
}

// Color schemes
const Colors = {
  light: {
    background: '#f5f5f5',
    surface: '#ffffff',
    border: '#e0e0e0',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#007AFF',
    // Card colors
    cardBlue: { bg: '#E3F2FD', border: '#2196F3' },
    cardGreen: { bg: '#E8F5E9', border: '#4CAF50' },
    cardPurple: { bg: '#F3E5F5', border: '#9C27B0' },
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    border: '#333333',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    accent: '#0a84ff',
    // Dark card colors - muted versions
    cardBlue: { bg: '#1a2634', border: '#2196F3' },
    cardGreen: { bg: '#1a2e1a', border: '#4CAF50' },
    cardPurple: { bg: '#2a1a2e', border: '#9C27B0' },
  },
};

export function BasicTourScreen({ isDark = false }: BasicTourScreenProps) {
  const colors = isDark ? Colors.dark : Colors.light;
  const tour = useTour();
  // Use 'any' to work around complex RN 0.81 ScrollView typing
  const scrollRef = useRef<any>(null);

  // Animation toggle state
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Modal demo state (demonstrates tour working above native modals)
  const [showModalDemo, setShowModalDemo] = useState(false);

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
    // Props-based tour - step content defined on TourStep components
    tour.start({
      animate: animationsEnabled,
      animationDuration: 500,
    });
  };

  // Handle opening the modal demo
  const handleOpenModalDemo = useCallback(() => {
    setShowModalDemo(true);
  }, []);

  // Handle closing the modal demo
  const handleCloseModalDemo = useCallback(() => {
    setShowModalDemo(false);
  }, []);

  return (
    <View style={styles.screenContainer}>
      {/* Floating Welcome Step - no children means floating tooltip */}
      <TourStep
        id="floating-welcome"
        order={0}
        title="Welcome to the Tour!"
        intro="This is a floating tooltip - it appears centered on screen without highlighting any element. Perfect for welcome messages!"
      />

      <ScrollView
        ref={scrollRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Header - Step 1 */}
        <TourStep
          id="welcome-header"
          order={1}
          title="Welcome!"
          intro="This is a demo of the react-native-intro library. Let me show you around!"
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              Basic Tour Demo
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Tap the button below to start the tour
            </Text>
          </View>
        </TourStep>

        {/* Animation Toggle */}
        <View
          style={[
            styles.toggleContainer,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            Animations
          </Text>
          <Switch
            value={animationsEnabled}
            onValueChange={setAnimationsEnabled}
            trackColor={{ true: colors.accent }}
          />
        </View>

        {/* Start Tour Button */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.accent }]}
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
            <Text style={[styles.statusText, { color: colors.accent }]}>
              Step {tour.currentStep + 1} of {tour.totalSteps}
            </Text>
          </View>
        )}

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          {/* Step 3 - Fast Setup */}
          <TourStep
            id="feature-1"
            order={3}
            title="Feature Highlight"
            intro="Each feature card can be highlighted with a spotlight effect and tooltip."
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBlue.bg,
                  borderLeftColor: colors.cardBlue.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Fast Setup
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Add guided tours to your app with minimal configuration.
              </Text>
            </View>
          </TourStep>

          {/* Step 4 - Customizable (with custom tooltip styling) */}
          <TourStep
            id="feature-2"
            order={4}
            title="🎨 Customizable Tooltips"
            intro={
              <View>
                <Text style={tourStepStyles.customContent}>
                  This tooltip demonstrates{' '}
                  <Text style={tourStepStyles.highlight}>custom styling</Text>!
                </Text>
                <View style={tourStepStyles.featureList}>
                  <Text style={tourStepStyles.featureItem}>
                    Custom background colors
                  </Text>
                  <Text style={tourStepStyles.featureItem}>
                    Rich ReactNode content
                  </Text>
                  <Text style={tourStepStyles.featureItem}>
                    Styled text and layouts
                  </Text>
                </View>
              </View>
            }
            tooltipStyle={{
              backgroundColor: '#1a1a2e',
              borderRadius: 16,
              borderWidth: 2,
              borderColor: '#4CAF50',
            }}
            tooltipTitleStyle={{
              color: '#69F0AE',
            }}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardGreen.bg,
                  borderLeftColor: colors.cardGreen.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Customizable
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Customize colors, themes, and button labels to match your app.
              </Text>
            </View>
          </TourStep>

          <TourStep id="feature-3">
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardPurple.bg,
                  borderLeftColor: colors.cardPurple.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Native Feel
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Built specifically for React Native with smooth animations.
              </Text>
            </View>
          </TourStep>
        </View>

        {/* Action Button - Step 6 */}
        <TourStep
          id="action-button"
          order={6}
          title="Try It Out!"
          intro='Go ahead and tap the "Get Started" button below to complete the tour!'
          hideButtons
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.actionButtonText}>Get Started</Text>
          </TouchableOpacity>
        </TourStep>

        {/* Additional info - Step 2 */}
        <TourStep
          id="info-text"
          order={2}
          title="Auto-Scroll"
          intro="The tour automatically scrolls to bring off-screen elements into view. Pretty cool, right?"
        >
          <View
            style={[
              styles.infoContainer,
              isDark && {
                backgroundColor: '#3D2C00',
                borderLeftColor: '#FF9800',
              },
            ]}
          >
            <Text style={[styles.infoText, isDark && { color: '#FFB74D' }]}>
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
            <View
              style={[styles.modalContent, { backgroundColor: colors.surface }]}
            >
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Tour Complete!
              </Text>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
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

      {/* FAB - Floating Action Button - Step 5 */}
      <TourStep
        id="fab-button"
        order={5}
        title="Small Elements"
        intro="The spotlight can highlight small elements too, like this floating action button! Tap it to open a modal demo."
        style={styles.fabWrapper}
      >
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={handleOpenModalDemo}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </TourStep>

      {/* Modal Demo - demonstrates tour working above native modals */}
      <Modal
        visible={showModalDemo}
        animationType="slide"
        onRequestClose={handleCloseModalDemo}
      >
        <IntroProvider>
          <ModalDemoContent
            isDark={isDark}
            animationsEnabled={animationsEnabled}
            onClose={handleCloseModalDemo}
          />
        </IntroProvider>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
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
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  fabWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
  },
  // Modal demo styles
  modalDemoContainer: {
    flex: 1,
  },
  modalDemoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalDemoHeaderContent: {
    flex: 1,
  },
  modalDemoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalDemoContent: {
    flex: 1,
    padding: 20,
  },
  modalDemoCard: {
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
});

// Custom styles for the customizable tour step (step 4)
const tourStepStyles = StyleSheet.create({
  customContent: {
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 22,
    marginBottom: 12,
  },
  highlight: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  featureList: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 6,
  },
});
