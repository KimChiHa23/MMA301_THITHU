import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Feature card hiển thị các tính năng nổi bật trên Home Screen
 * @param {{ icon: string, title: string, description: string }} props
 */
export const FeatureCard = ({ icon, title, description }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color="#4F46E5" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
