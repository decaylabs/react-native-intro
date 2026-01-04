/**
 * HintsScreen - Demo screen showing hints functionality
 *
 * Demonstrates props-based hint configuration where hint content
 * is defined on HintSpot components and global options are passed
 * to hints.show().
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { HintSpot, useHints } from 'react-native-intro';

interface HintsScreenProps {
  isDark?: boolean;
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
    iconBackground: '#f0f0f0',
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
    iconBackground: '#2c2c2e',
    // Dark card colors
    cardBlue: { bg: '#1a2634', border: '#2196F3' },
    cardGreen: { bg: '#1a2e1a', border: '#4CAF50' },
    cardPurple: { bg: '#2a1a2e', border: '#9C27B0' },
  },
};

export function HintsScreen({ isDark = false }: HintsScreenProps) {
  const colors = isDark ? Colors.dark : Colors.light;
  const hints = useHints();
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const toggleHints = () => {
    if (hints.isVisible) {
      hints.hide();
    } else {
      // Props-based: hints.show() uses hint props from HintSpot components
      // Global options can be passed directly (smart detection)
      hints.show({
        animation: animationsEnabled,
        closeOnOutsideClick: true,
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header with action buttons */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Props-based hint configuration */}
        <HintSpot
          id="avatar"
          hint="Tap to change your profile photo"
          hintPosition="bottom-right"
          hintType="info"
        >
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </HintSpot>

        <Text style={[styles.title, { color: colors.text }]}>Hints Demo</Text>

        <View style={styles.headerIcons}>
          <HintSpot
            id="search"
            hint="Search for anything in the app"
            hintPosition="bottom-left"
            hintType="info"
          >
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Text style={styles.iconText}>🔍</Text>
            </TouchableOpacity>
          </HintSpot>

          <HintSpot
            id="notifications"
            hint="You have 3 unread notifications!"
            hintPosition="bottom-center"
            hintType="warning"
          >
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Text style={styles.iconText}>🔔</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </HintSpot>

          <HintSpot
            id="settings"
            hint="Access app settings and preferences"
            hintPosition="bottom-center"
          >
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Text style={styles.iconText}>⚙️</Text>
            </TouchableOpacity>
          </HintSpot>
        </View>
      </View>

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
          Pulse Animation
        </Text>
        <Switch
          value={animationsEnabled}
          onValueChange={setAnimationsEnabled}
          trackColor={{ false: '#767577', true: colors.accent }}
          thumbColor={animationsEnabled ? colors.accent : '#f4f3f4'}
        />
        <Text style={[styles.toggleStatus, { color: colors.textSecondary }]}>
          {animationsEnabled ? 'ON' : 'OFF'}
        </Text>
      </View>

      {/* Toggle Hints Button */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { borderColor: colors.accent },
            hints.isVisible
              ? { backgroundColor: colors.surface }
              : { backgroundColor: colors.accent },
          ]}
          onPress={toggleHints}
        >
          <Text
            style={[
              styles.toggleButtonText,
              hints.isVisible ? { color: colors.accent } : { color: '#ffffff' },
            ]}
          >
            {hints.isVisible ? 'Hide Hints' : 'Show Hints'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View
        style={[
          styles.infoContainer,
          isDark && { backgroundColor: '#3D2C00', borderLeftColor: '#FF9800' },
        ]}
      >
        <Text style={styles.infoTitle}>How Hints Work</Text>
        <Text style={styles.infoText}>
          • Wrap elements with{' '}
          <Text style={styles.codeText}>{`<HintSpot>`}</Text> and add{' '}
          <Text style={styles.codeText}>hint</Text> prop
        </Text>
        <Text style={styles.infoText}>
          • Call <Text style={styles.codeText}>hints.show()</Text> to activate
          all hints
        </Text>
        <Text style={styles.infoText}>
          • Pass global options like{' '}
          <Text style={styles.codeText}>animation</Text> to{' '}
          <Text style={styles.codeText}>show()</Text>
        </Text>
        <Text style={styles.infoText}>
          • Tap an indicator to reveal the tooltip
        </Text>
        <Text style={styles.infoText}>
          • Tap outside to dismiss the tooltip
        </Text>
      </View>

      {/* Feature Cards */}
      <View style={styles.cardsContainer}>
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
            🎯 Contextual Help
          </Text>
          <Text
            style={[styles.cardDescription, { color: colors.textSecondary }]}
          >
            Hints provide contextual information without interrupting the user
            experience.
          </Text>
        </View>

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
            ✨ Non-Intrusive
          </Text>
          <Text
            style={[styles.cardDescription, { color: colors.textSecondary }]}
          >
            Unlike tours, hints stay visible until the user dismisses them.
          </Text>
        </View>

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
            📍 Positioned
          </Text>
          <Text
            style={[styles.cardDescription, { color: colors.textSecondary }]}
          >
            Position indicators at different corners of your elements.
          </Text>
        </View>
      </View>

      {/* Help Button */}
      <HintSpot
        id="help-button"
        hint="Get help or contact support anytime"
        hintPosition="top-center"
        hintType="success"
      >
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </HintSpot>

      {/* Spacer */}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
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
  controlsContainer: {
    padding: 16,
  },
  toggleButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  toggleButtonInactive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButtonTextInactive: {
    color: '#ffffff',
  },
  toggleButtonTextActive: {
    color: '#007AFF',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    borderRadius: 4,
    color: '#E91E63',
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  helpButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});
