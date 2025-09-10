import React, { useMemo, useRef } from 'react';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';
import { useDistrictSelection } from '@/contexts/DistrictSelectionContext';
import { WEST_BENGAL_POLYGONS } from '@/data/westBengalGeo';

// Re-use existing styling palette from GISMap for coherence.

export default function DistrictMap() {
  const { districts, selectedDistrictId, setSelectedDistrictId, selectedDistrict } = useDistrictSelection();
  const mapRef = useRef<MapView>(null);

  const region = {
    latitude: 23.5,
    longitude: 87.3,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  const districtPolygons = useMemo(() => districts, [districts]);

  return (
    <View style={styles.wrapper}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        zoomEnabled
        scrollEnabled
      >
        {/* Base West Bengal fill for context */}
        {WEST_BENGAL_POLYGONS.map((poly, i) => (
          <Polygon key={`wb-base-${i}`} coordinates={poly} strokeColor="transparent" fillColor="rgba(0,77,153,0.10)" zIndex={1} />
        ))}
        {/* District borders */}
        {districtPolygons.map(d => (
          <Polygon
            key={d.id}
            coordinates={d.polygons[0] || []}
            strokeColor={d.id === selectedDistrictId ? '#E0A100' : 'rgba(0,0,0,0.45)'}
            strokeWidth={d.id === selectedDistrictId ? 3 : 1}
            fillColor={d.id === selectedDistrictId ? 'rgba(255,193,7,0.25)' : 'rgba(0,0,0,0.0)'}
            tappable
            onPress={() => setSelectedDistrictId(d.id === selectedDistrictId ? null : d.id)}
            zIndex={d.id === selectedDistrictId ? 3 : 2}
          />
        ))}
      </MapView>
      {selectedDistrict && (
        <View style={styles.fabBox} pointerEvents="none">
          <Text style={styles.fabTitle}>{selectedDistrict.name}</Text>
          <Text style={styles.fabMeta}>{selectedDistrict.polygons.length} ring(s)</Text>
        </View>
      )}
      {districts.length === 0 && (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <Text style={styles.emptyText}>Add district GeoJSON data to enable borders.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: 380, borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE3E8', margin: 16 },
  fabBox: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,77,153,0.95)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  fabTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fabMeta: { color: '#E8F2FF', fontSize: 12, marginTop: 2 },
  emptyOverlay: { position: 'absolute', top: 0, left:0, right:0, bottom:0, justifyContent: 'center', alignItems:'center', padding: 20 },
  emptyText: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, fontSize: 14, color: '#333' },
});
