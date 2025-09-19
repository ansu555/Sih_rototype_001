import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, ScrollView } from 'react-native';
import GISMap from '@/components/GISMap';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900; // breakpoint for two columns
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const toggleMapFullscreen = () => setMapFullscreen(f => !f);
  // Aspect ratio height when not fullscreen (limit for very tall screens)
  const mapHeight = Math.min(Math.max(width * 0.55, 320), 540); // clamp between 320 and 540
  const { state: { menuOpen, stationData }, actions: { toggleMenu, onLogout } } = useDashboard();

  return (
    <View style={styles.page}>      
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <View style={styles.logoBox}><Text style={styles.logoText}>DW</Text></View>
          <Text style={styles.appTitle}>DWLR Monitoring</Text>
        </View>
        <View style={styles.navRight}>
      <TouchableOpacity style={styles.avatar} onPress={toggleMenu} accessibilityRole="button" accessibilityLabel="User menu">
            <Text style={styles.avatarText}>AK</Text>
          </TouchableOpacity>
          {menuOpen && (
            <View style={styles.dropdown}>
        <TouchableOpacity style={styles.dropdownItem} onPress={() => { /* future settings route */ }}>
                <Text style={styles.dropdownText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={onLogout}>
                <Text style={[styles.dropdownText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {mapFullscreen ? (
        <View style={styles.fullscreenContainer}> 
          <GISMap stations={stationData} fullscreen onToggleFullscreen={toggleMapFullscreen} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.contentWrapper, !isWide && styles.contentStack]}>        
            <View style={[styles.column, styles.leftCol]}> 
              <PlaceholderPanel title="Spatial Distribution (GIS)">
                <GISMap stations={stationData} height={mapHeight} onToggleFullscreen={toggleMapFullscreen} />
              </PlaceholderPanel>
            </View>
            <View style={[styles.column, isWide ? styles.rightCol : null]}> 
              <PlaceholderPanel title="Recent Alerts">
                <Text style={styles.placeholderText}>• High drawdown at Well #A12{'\n'}• Rapid recharge anomaly at Site 7{'\n'}• Salinity threshold exceeded in Block 3</Text>
              </PlaceholderPanel>
              <PlaceholderPanel title="Data Quality Flags">
                <Text style={styles.placeholderText}>[Quality table placeholder]</Text>
              </PlaceholderPanel>
              <PlaceholderPanel title="Planned Maintenance">
                <Text style={styles.placeholderText}>[Schedule placeholder]</Text>
              </PlaceholderPanel>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function PlaceholderPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <View style={styles.panelBody}>{children}</View>
    </View>
  );
}

// Data moved to hooks & data modules.

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { paddingBottom: 24 }, // contentContainerStyle for ScrollView
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E3E6E8', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 16, position: 'relative' },
  logoBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0066CC', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  appTitle: { fontSize: 18, fontWeight: '700', color: '#004D99' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CCE6F9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#B3D8F3' },
  avatarText: { fontWeight: '600', color: '#004D99' },
  dropdown: { position: 'absolute', top: 54, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E4E7', paddingVertical: 4, minWidth: 160, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownText: { fontSize: 14, color: '#0066CC', fontWeight: '500' },
  logoutText: { color: '#CC3300' },
  contentWrapper: { flexGrow: 1, flexDirection: 'row', padding: 20, gap: 20 }, // Changed flex: 1 to flexGrow: 1 for ScrollView content
  contentStack: { flexDirection: 'column' },
  column: { flex: 1, gap: 20 },
  leftCol: {},
  rightCol: { maxWidth: 420 },
  panel: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E0E4E7', padding: 18, gap: 12 },
  panelTitle: { fontSize: 15, fontWeight: '700', color: '#004D99' },
  panelBody: { minHeight: 80 },
  placeholderText: { fontSize: 13, color: '#5A6A78', lineHeight: 18 },
  fullscreenContainer: { flex: 1, backgroundColor: '#000' },
});

