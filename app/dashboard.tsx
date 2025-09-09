import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Empty state – build your widgets here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F9FC', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#004D99', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#44627A' },
});
