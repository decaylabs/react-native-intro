import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import type { ReactNode } from 'react';

interface DemoCardProps {
  title: string;
  description?: string;
  buttonLabel?: string;
  onPress?: () => void;
  children?: ReactNode;
  isDark?: boolean;
}

const Colors = {
  light: {
    cardBackground: '#ffffff',
    cardBorder: '#e0e0e0',
    title: '#333333',
    description: '#666666',
    buttonBackground: '#007AFF',
    buttonText: '#ffffff',
  },
  dark: {
    cardBackground: '#1e1e1e',
    cardBorder: '#333333',
    title: '#ffffff',
    description: '#a0a0a0',
    buttonBackground: '#0a84ff',
    buttonText: '#ffffff',
  },
};

export function DemoCard({
  title,
  description,
  buttonLabel,
  onPress,
  children,
  isDark = false,
}: DemoCardProps) {
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>{title}</Text>

      {description && (
        <Text style={[styles.description, { color: colors.description }]}>
          {description}
        </Text>
      )}

      {children && <View style={styles.content}>{children}</View>}

      {buttonLabel && onPress && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonBackground }]}
          onPress={onPress}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  content: {
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
