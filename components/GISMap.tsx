import React, { useRef } from 'react';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WEST_BENGAL_POLYGONS } from '../data/westBengalGeo';

interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  depthMeters: number;
}

const desaturatedStyle = [
  { elementType: 'geometry', stylers: [{ saturation: -100 }, { lightness: 10 }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ saturation: -100 }, { lightness: 40 }] },
  { featureType: 'water', stylers: [{ color: '#b3cde0' }] },
];

export default function GISMap({ stations, height = 260 }: { stations: Station[]; height?: number }) {
  const mapRef = useRef<MapView>(null);

  // Override initial region to West Bengal for now
  const region = {
    latitude: 23.5,      // center of West Bengal
    longitude: 87.3,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  const handleZoomIn = () => {
    mapRef.current?.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta * 0.5,
      longitudeDelta: region.longitudeDelta * 0.5,
    });
  };

  const handleZoomOut = () => {
    mapRef.current?.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    });
  };

  return (
    <View style={[styles.wrapper, { height }] }>
      <MapView 
        ref={mapRef}
        style={StyleSheet.absoluteFill} 
        initialRegion={region}
        zoomEnabled={true}
        scrollEnabled={true}
        customMapStyle={desaturatedStyle}
      >
        {WEST_BENGAL_POLYGONS.map((poly, idx) => (
            <Polygon
            key={`wb-${idx}`}
             coordinates={poly}
             strokeColor="#004D99"
             strokeWidth={2}
             fillColor="rgba(0,77,153,0.18)"
             zIndex={2}
            />
          ))}
        {stations.map(s => (
          <Marker key={s.id} coordinate={{ latitude: s.latitude, longitude: s.longitude }} title={s.name} description={`Depth: ${s.depthMeters} m`}>
            <View style={styles.marker}> 
              <Text style={styles.markerText}>{Math.round(s.depthMeters)}m</Text>
            </View>
          </Marker>
        ))}
      </MapView>
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE3E8' },
  marker: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#004D99' },
  markerText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  zoomControls: { position: 'absolute', bottom: 16, right: 8, gap: 8 },
  zoomButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  zoomButtonText: { fontSize: 20, fontWeight: 'bold', color: '#004D99' },
});
