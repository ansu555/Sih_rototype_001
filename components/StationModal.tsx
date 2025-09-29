import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { GroundwaterStationLatest } from '@/data/groundwater';
import { useGroundwater } from '@/contexts/GroundwaterContext';

interface Props {
  visible: boolean;
  station: GroundwaterStationLatest | null;
  onClose: () => void;
}

export default function StationModal({ visible, station, onClose }: Props) {
  const { stations, districtSummaries } = useGroundwater();
  if (!station) return null;

  const ageDays = Math.max(0, Math.floor((Date.now() - station.latestTime.getTime()) / 86400000));
  const status = station.latestDepth < 10 ? 'Safe' : station.latestDepth < 20 ? 'Semi-Critical' : 'Critical';
  const acquisition = station.acquisition || '—';

  const districtStats = districtSummaries.find(d => d.district === station.district);
  const districtRange = districtStats ? `${districtStats.minDepth?.toFixed(1)}–${districtStats.maxDepth?.toFixed(1)} m` : '—';

  // (Future) Trend sparkline placeholder – needs historical retention beyond latest
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityLabel="Station details sheet">
          <Text style={styles.title}>{station.name}</Text>
          <Text style={styles.meta}>{station.stationCode} • {station.district}</Text>
          <View style={styles.row}><Text style={styles.label}>Latest Depth</Text><Text style={styles.value}>{station.latestDepth.toFixed(2)} m</Text></View>
          <View style={styles.row}><Text style={styles.label}>Status</Text><Text style={[styles.value, station.latestDepth < 10 ? styles.safe : station.latestDepth < 20 ? styles.warn : styles.danger]}>{status}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Acquisition</Text><Text style={styles.value}>{acquisition}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Last Reading</Text><Text style={styles.value}>{ageDays} day{ageDays===1?'':'s'} ago</Text></View>
          <View style={styles.row}><Text style={styles.label}>Readings Count</Text><Text style={styles.value}>{station.readingsCount}</Text></View>
          <View style={styles.row}><Text style={styles.label}>District Range</Text><Text style={styles.value}>{districtRange}</Text></View>
          <View style={styles.sparklineBox}>
            <Text style={styles.sparklineLabel}>Trend (preview)</Text>
            <Text style={styles.sparklinePlaceholder}>Sparkline coming soon – needs historical cache</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close station details">
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', padding: 18, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  title: { fontSize: 16, fontWeight: '700', color: '#004D99' },
  meta: { fontSize: 12, color: '#66788A', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { color: '#556A78', fontSize: 13 },
  value: { fontWeight: '700', color: '#223' },
  closeBtn: { marginTop: 12, alignSelf: 'center', backgroundColor: '#E0A100', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  closeText: { color: '#fff', fontWeight: '700' },
  safe: { color: '#2e8b57' },
  warn: { color: '#ffcc00' },
  danger: { color: '#ff4500' },
  sparklineBox: { marginTop: 12, padding: 10, borderWidth: 1, borderColor: '#EBEFF2', borderRadius: 8, backgroundColor: '#FAFCFD' },
  sparklineLabel: { fontSize: 12, fontWeight: '600', color: '#556A78', marginBottom: 4 },
  sparklinePlaceholder: { fontSize: 11, color: '#8898A8' },
});
