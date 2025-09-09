import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';

export type StationStatus = 'safe' | 'semi-critical' | 'critical';

interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  depthMeters: number;
  status: StationStatus;
}

const STATUS_COLOR: Record<StationStatus, string> = {
  safe: '#1B8F2A',
  'semi-critical': '#E2A400',
  critical: '#C62828',
};

export default function GISMap({ stations, height = 260 }: { stations: Station[]; height?: number }) {
  const region = {
    latitude: stations[0]?.latitude || 20.5937,
    longitude: stations[0]?.longitude || 78.9629,
    latitudeDelta: 10,
    longitudeDelta: 10,
  };

  return (
    <View style={[styles.wrapper, { height }] }>
      <MapView style={StyleSheet.absoluteFill} initialRegion={region} provider={PROVIDER_GOOGLE}>
        {stations.map(s => (
          <Marker key={s.id} coordinate={{ latitude: s.latitude, longitude: s.longitude }} title={s.name} description={`Depth: ${s.depthMeters} m`}>
            <View style={[styles.marker, { backgroundColor: STATUS_COLOR[s.status] }]}> 
              <Text style={styles.markerText}>{Math.round(s.depthMeters)}m</Text>
            </View>
          </Marker>
        ))}
      </MapView>
      <View style={styles.legend} pointerEvents="none">
        <Text style={styles.legendTitle}>Status</Text>
        <View style={styles.legendRow}><View style={[styles.legendDot,{backgroundColor:STATUS_COLOR.safe}]} /><Text style={styles.legendLabel}>Safe</Text></View>
        <View style={styles.legendRow}><View style={[styles.legendDot,{backgroundColor:STATUS_COLOR['semi-critical']}]} /><Text style={styles.legendLabel}>Semi-Critical</Text></View>
        <View style={styles.legendRow}><View style={[styles.legendDot,{backgroundColor:STATUS_COLOR.critical}]} /><Text style={styles.legendLabel}>Critical</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE3E8' },
  marker: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  markerText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  legend: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 12, gap: 4 },
  legendTitle: { fontSize: 11, fontWeight: '700', color: '#004D99' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, color: '#334A59' },
});
