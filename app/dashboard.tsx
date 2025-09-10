import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import GISMap from '@/components/GISMap';
import { useDashboard } from '@/hooks/useDashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900; // breakpoint for two columns
  const { state: { menuOpen, stationData, metricData }, actions: { toggleMenu, onLogout } } = useDashboard();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure the component is fully mounted before rendering
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.contentWrapper, !isWide && styles.contentStack]}>        
            <View style={[styles.column, styles.leftCol]}> 
              <PlaceholderPanel title="Spatial Distribution (GIS)">
                <GISMap stations={stationData} height={isWide ? 380 : 260} />
              </PlaceholderPanel>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
              <View style={styles.metricGrid}>
                {metricData.map(m => (
                  <MetricCard key={m.key} label={m.label} value={m.value} trend={m.trend} highlight={m.highlight} />
                ))}
              </View>
              <PlaceholderPanel title="Trend Analysis (30d)">
                <Text style={styles.placeholderText}>[Chart placeholder]</Text>
              </PlaceholderPanel>
            </View>
            <View style={[styles.column, isWide ? styles.rightCol : null]}> 
              <PlaceholderPanel title="Recent Alerts">
                <Text style={styles.placeholderText}>• High drawdown at Well #A12{"\n"}• Rapid recharge anomaly at Site 7{ "\n"}• Salinity threshold exceeded in Block 3</Text>
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
      </View>
    </ErrorBoundary>
  );
}

function MetricCard({ label, value, trend, highlight }: { label: string; value: string; trend: string; highlight?: boolean }) {
  return (
    <View style={[styles.metricCard, highlight && styles.metricCardHighlight]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={[styles.metricTrend, trend.startsWith('-') ? styles.trendDown : styles.trendUp]}>{trend}</Text>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#0066CC', fontWeight: '600' },
  scrollContent: { paddingBottom: 24 },
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
  contentWrapper: { flex: 1, flexDirection: 'row', padding: 20, gap: 20 },
  contentStack: { flexDirection: 'column' },
  column: { flex: 1, gap: 20 },
  leftCol: {},
  rightCol: { maxWidth: 420 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#003B73' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metricCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E0E4E7', gap: 4 },
  metricCardHighlight: { borderColor: '#FFB347', backgroundColor: '#FFF8F0' },
  metricLabel: { fontSize: 12, fontWeight: '600', color: '#44627A', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: 24, fontWeight: '700', color: '#004D99' },
  metricTrend: { fontSize: 14, fontWeight: '600' },
  trendUp: { color: '#1B8F2A' },
  trendDown: { color: '#C62828' },
  panel: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E0E4E7', padding: 18, gap: 12 },
  panelTitle: { fontSize: 15, fontWeight: '700', color: '#004D99' },
  panelBody: { minHeight: 80 },
  placeholderText: { fontSize: 13, color: '#5A6A78', lineHeight: 18 },
});

