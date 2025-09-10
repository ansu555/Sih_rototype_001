import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useGroundwater } from '@/contexts/GroundwaterContext';
import { useDistrictSelection } from '@/contexts/DistrictSelectionContext';

interface DataPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function DataPanel({ visible, onClose }: DataPanelProps) {
  const { stations } = useGroundwater();
  const { selectedDistrict } = useDistrictSelection();
  const [slideAnim] = useState(new Animated.Value(-300));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  const filteredStations = useMemo(() => {
    let filtered = stations;
    
    // Filter by district if selected
    if (selectedDistrict) {
      filtered = filtered.filter(s => s.district === selectedDistrict.name);
    }
    
    // Filter by date range if set
    if (startDate || endDate) {
      filtered = filtered.filter(s => {
        const stationDate = s.latestTime;
        if (startDate && stationDate < startDate) return false;
        if (endDate && stationDate > endDate) return false;
        return true;
      });
    }
    
    return filtered;
  }, [stations, selectedDistrict, startDate, endDate]);

  const summary = useMemo(() => {
    if (selectedDistrict) {
      return {
        title: selectedDistrict.name,
        totalStations: filteredStations.length,
        avgDepth: filteredStations.length > 0 ? 
          filteredStations.reduce((sum, s) => sum + s.latestDepth, 0) / filteredStations.length : 0,
        latestDataTime: filteredStations.length > 0 ? 
          new Date(Math.max(...filteredStations.map(s => s.latestTime.getTime()))) : null,
        acquisitionModes: [...new Set(filteredStations.map(s => s.acquisition).filter(Boolean))],
        statuses: [...new Set(filteredStations.map(s => s.status).filter(Boolean))],
      };
    } else {
      // State-level summary
      return {
        title: 'West Bengal',
        totalStations: filteredStations.length,
        avgDepth: filteredStations.length > 0 ? 
          filteredStations.reduce((sum, s) => sum + s.latestDepth, 0) / filteredStations.length : 0,
        latestDataTime: filteredStations.length > 0 ? 
          new Date(Math.max(...filteredStations.map(s => s.latestTime.getTime()))) : null,
        acquisitionModes: [...new Set(filteredStations.map(s => s.acquisition).filter(Boolean))],
        statuses: [...new Set(filteredStations.map(s => s.status).filter(Boolean))],
      };
    }
  }, [selectedDistrict, filteredStations]);

  const dataRange = useMemo(() => {
    if (filteredStations.length === 0) return { start: null, end: null };
    const times = filteredStations.map(s => s.latestTime.getTime());
    return {
      start: new Date(Math.min(...times)),
      end: new Date(Math.max(...times))
    };
  }, [filteredStations]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      {/* Sliding Panel */}
      <Animated.View 
        style={[
          styles.panel,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{summary.title} Data</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {/* Data Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Range</Text>
            <Text style={styles.value}>
              {dataRange.start ? dataRange.start.toLocaleDateString() : 'No data'} - {dataRange.end ? dataRange.end.toLocaleDateString() : ''}
            </Text>
          </View>

          {/* Total Stations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Total Stations</Text>
            <Text style={styles.value}>{summary.totalStations}</Text>
          </View>

          {/* Average Depth */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Average Depth (BGL)</Text>
            <Text style={styles.value}>{summary.avgDepth.toFixed(2)} m</Text>
          </View>

          {/* Latest Data Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Data Time</Text>
            <Text style={styles.value}>
              {summary.latestDataTime ? summary.latestDataTime.toLocaleString() : 'No data'}
            </Text>
          </View>

          {/* Station Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Station Status</Text>
            {summary.statuses.map(status => (
              <Text key={status} style={styles.listItem}>• {status}</Text>
            ))}
          </View>

          {/* Data Acquisition Mode */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Acquisition Mode</Text>
            {summary.acquisitionModes.map(mode => (
              <Text key={mode} style={styles.listItem}>• {mode}</Text>
            ))}
          </View>

          {/* Time Filter Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filter by Time Range</Text>
            <View style={styles.dateControls}>
              <TouchableOpacity 
                style={styles.dateBtn}
                onPress={() => {
                  // In a real app, you'd open a date picker here
                  console.log('Open start date picker');
                }}
              >
                <Text style={styles.dateBtnText}>
                  Start: {startDate ? startDate.toLocaleDateString() : 'Any'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateBtn}
                onPress={() => {
                  console.log('Open end date picker');
                }}
              >
                <Text style={styles.dateBtnText}>
                  End: {endDate ? endDate.toLocaleDateString() : 'Any'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {(startDate || endDate) && (
              <TouchableOpacity 
                style={styles.clearBtn}
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fff',
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#004D99',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004D99',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  dateControls: {
    gap: 8,
  },
  dateBtn: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateBtnText: {
    fontSize: 14,
    color: '#004D99',
  },
  clearBtn: {
    padding: 8,
    backgroundColor: '#ff4444',
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearBtnText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
