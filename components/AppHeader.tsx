import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function AppHeader({ title = 'Groundwater App' }: { title?: string }) {
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.header, theme === 'dark' ? styles.headerDark : styles.headerLight]}>
      <Text style={[styles.title, theme === 'dark' ? styles.titleDark : styles.titleLight]}>{title}</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={() => {/* TODO: wire export */}}>
          <Text style={styles.btnText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => {/* TODO: open settings */}}>
          <Text style={styles.btnText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E6EEF8',
  },
  headerDark: {
    backgroundColor: '#0F1724',
    borderBottomColor: '#1F2937',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleLight: { color: '#0F1724' },
  titleDark: { color: '#FFF' },
  controls: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.04)' },
  btnText: { fontSize: 14 }
});

export default AppHeader;
