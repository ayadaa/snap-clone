/**
 * Stories Screen
 * Displays user stories and snap inbox for testing
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { SnapInbox } from '../../components/snaps/SnapInbox';

export function StoriesScreen() {
  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stories & Snaps</Text>
      </View>
      
      {/* Temporary: Show SnapInbox for testing */}
      <View style={styles.snapSection}>
        <SnapInbox style={styles.snapInbox} />
      </View>
      
      <View style={styles.storiesSection}>
        <Text style={styles.sectionTitle}>Stories</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Stories functionality coming soon...
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  snapSection: {
    flex: 1,
    margin: 16,
  },
  snapInbox: {
    flex: 1,
  },
  storiesSection: {
    flex: 1,
    margin: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
}); 