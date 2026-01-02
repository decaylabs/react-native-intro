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

export function HintsScreen() {
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
    <ScrollView style={styles.container}>
      {/* Header with action buttons */}
      <View style={styles.header}>
        {/* Props-based hint configuration */}
        <HintSpot
          id="avatar"
          hint="Tap to change your profile photo"
          hintPosition="bottom-right"
          hintType="info"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </HintSpot>

        <Text style={styles.title}>Hints Demo</Text>

        <View style={styles.headerIcons}>
          <HintSpot
            id="search"
            hint="Search for anything in the app"
            hintPosition="bottom-left"
            hintType="info"
          >
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔍</Text>
            </TouchableOpacity>
          </HintSpot>

          <HintSpot
            id="notifications"
            hint="You have 3 unread notifications!"
            hintPosition="bottom-center"
            hintType="warning"
          >
            <TouchableOpacity style={styles.iconButton}>
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
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>⚙️</Text>
            </TouchableOpacity>
          </HintSpot>
        </View>
      </View>

      {/* Animation Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Pulse Animation</Text>
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

      {/* Toggle Hints Button */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            hints.isVisible
              ? styles.toggleButtonActive
              : styles.toggleButtonInactive,
          ]}
          onPress={toggleHints}
        >
          <Text
            style={[
              styles.toggleButtonText,
              hints.isVisible
                ? styles.toggleButtonTextActive
                : styles.toggleButtonTextInactive,
            ]}
          >
            {hints.isVisible ? 'Hide Hints' : 'Show Hints'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
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
        <View style={[styles.card, styles.cardBlue]}>
          <Text style={styles.cardTitle}>🎯 Contextual Help</Text>
          <Text style={styles.cardDescription}>
            Hints provide contextual information without interrupting the user
            experience.
          </Text>
        </View>

        <View style={[styles.card, styles.cardGreen]}>
          <Text style={styles.cardTitle}>✨ Non-Intrusive</Text>
          <Text style={styles.cardDescription}>
            Unlike tours, hints stay visible until the user dismisses them.
          </Text>
        </View>

        <View style={[styles.card, styles.cardPurple]}>
          <Text style={styles.cardTitle}>📍 Positioned</Text>
          <Text style={styles.cardDescription}>
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
