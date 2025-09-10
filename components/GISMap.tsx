import React, { useRef, useState } from 'react';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, MapType } from 'react-native-maps';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WEST_BENGAL_POLYGONS } from '../data/westBengalGeo';
import { INDIA_OUTLINE_POLYGONS } from '../data/indiaOutline';

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
  const [mapType, setMapType] = useState<MapType>('standard');

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
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        customMapStyle={mapType === 'standard' ? desaturatedStyle : undefined}
      >
        {INDIA_OUTLINE_POLYGONS.map((poly, idx) => (
          <Polygon
            key={`india-${idx}`}
            coordinates={poly}
            strokeColor="rgba(0,0,0,0.25)"
            strokeWidth={1}
            fillColor="rgba(0,0,0,0.03)"
            zIndex={1}
          />
        ))}
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
      <View style={styles.mapTypeBar}>
        {(['standard','satellite','terrain','hybrid'] as MapType[]).map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, mapType === type && styles.typeButtonActive]}
            onPress={() => setMapType(type)}
          >
            <Text style={[styles.typeText, mapType === type && styles.typeTextActive]}>
              {type.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE3E8', width: '100%', alignSelf: 'stretch' },
  marker: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#004D99' },
  markerText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  zoomControls: { position: 'absolute', bottom: 16, right: 8, gap: 8 },
  zoomButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  zoomButtonText: { fontSize: 20, fontWeight: 'bold', color: '#004D99' },
  mapTypeBar: { position: 'absolute', top: 12, right: 8, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4, gap: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity: 0.15, shadowRadius: 3 },
  typeButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#004D99' },
  typeText: { fontSize: 12, fontWeight: '600', color: '#004D99' },
  typeTextActive: { color: '#fff' },
});
