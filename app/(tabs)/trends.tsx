import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Modal, FlatList } from 'react-native';
import TrendChart from '@/components/TrendChart';
import { useDistrictSelection } from '@/contexts/DistrictSelectionContext';
import { useGroundwater } from '@/contexts/GroundwaterContext';

export default function TrendsScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const { districts, selectedDistrictId, setSelectedDistrictId, selectedDistrict } = useDistrictSelection();
  const { stations } = useGroundwater();
  
  const [dateRange, setDateRange] = useState('Jan 2023 - Dec 2023');
  const [zoomLevel, setZoomLevel] = useState('6M');
  const [selectedStation, setSelectedStation] = useState(null);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [availableStations, setAvailableStations] = useState([]);
  
  const [trendSummary, setTrendSummary] = useState({
    average: 0,
    trend: 0,
    seasonal: 'Monsoon',
    forecast: 0
  });

  useEffect(() => {
    calculateTrendSummary();
    updateAvailableStations();
  }, [selectedDistrictId, stations]);

  const getDistrictsWithData = () => {
    // Get unique districts that have station data
    const districtsWithData = [...new Set(stations.map(s => s.district))]
      .map(districtName => districts.find(d => d.name === districtName))
      .filter(Boolean); // Remove undefined values
    
    return districtsWithData;
  };

  const updateAvailableStations = () => {
    const filteredStations = selectedDistrictId 
      ? stations.filter(s => {
          const districtObj = districts.find(d => d.id === selectedDistrictId);
          return s.district === districtObj?.name;
        })
      : stations;
    
    setAvailableStations(filteredStations);
    if (filteredStations.length > 0 && !selectedStation) {
      setSelectedStation(filteredStations[0]);
    }
  };

  const calculateTrendSummary = () => {
    const filteredStations = selectedDistrictId 
      ? stations.filter(s => {
          const districtObj = districts.find(d => d.id === selectedDistrictId);
          return s.district === districtObj?.name;
        })
      : stations;

    if (filteredStations.length > 0) {
      const avgDepth = filteredStations.reduce((sum, s) => sum + s.latestDepth, 0) / filteredStations.length;
      setTrendSummary({
        average: avgDepth,
        trend: -0.3, // Mock trend
        seasonal: 'Monsoon',
        forecast: avgDepth + 0.5
      });
    }
  };

  const events = [
    { type: 'Monsoon Peak', date: 'Jul 23', color: '#4CAF50' },
    { type: 'Dry Season', date: 'Mar 23', color: '#FF9800' },
    { type: 'Anomaly Detected', date: 'Feb 23', color: '#F44336' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📈 Groundwater Trends Analysis</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Export 📊</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Settings ⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Controls Section */}
        <View style={styles.controlsSection}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>District:</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowDistrictPicker(true)}
            >
              <Text style={styles.dropdownText}>
                {selectedDistrict?.name || 'All Districts'} ▼
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.compareBtn}>
              <Text style={styles.compareBtnText}>Compare +</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Date Range:</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>{dateRange} ▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trend Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📊 TREND SUMMARY</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average:</Text>
              <Text style={styles.summaryValue}>{trendSummary.average.toFixed(1)}m bgl</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Trend:</Text>
              <Text style={[styles.summaryValue, { color: trendSummary.trend < 0 ? '#F44336' : '#4CAF50' }]}>
                {trendSummary.trend < 0 ? '↓' : '↑'} {Math.abs(trendSummary.trend).toFixed(1)}m/month
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Seasonal:</Text>
              <Text style={styles.summaryValue}>↑ {trendSummary.seasonal}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Forecast:</Text>
              <Text style={styles.summaryValue}>{trendSummary.forecast.toFixed(1)}m (30 days)</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>View Details ▼</Text>
          </TouchableOpacity>
        </View>

        {/* Time Series Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>📈 TIME SERIES CHART</Text>
          <View style={styles.chartContainer}>
            <TrendChart />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                <Text style={styles.legendText}>Historical Data</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F39C12' }]} />
                <Text style={styles.legendText}>Forecast</Text>
              </View>
            </View>
            <View style={styles.zoomControls}>
              {['1M', '3M', '6M', '1Y', 'All'].map(zoom => (
                <TouchableOpacity 
                  key={zoom}
                  style={[styles.zoomBtn, zoomLevel === zoom && styles.zoomBtnActive]}
                  onPress={() => setZoomLevel(zoom)}
                >
                  <Text style={[styles.zoomBtnText, zoomLevel === zoom && styles.zoomBtnTextActive]}>
                    {zoom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Station Details & Events */}
        <View style={[styles.bottomSection, isWide && styles.bottomSectionWide]}>
          <View style={styles.stationDetails}>
            <Text style={styles.sectionTitle}>🔍 STATION DETAILS</Text>
            
            {/* Station Selector Dropdown */}
            <View style={styles.stationSelector}>
              <Text style={styles.selectorLabel}>Select Station:</Text>
              <TouchableOpacity 
                style={styles.stationDropdown}
                onPress={() => setShowStationPicker(true)}
              >
                <Text style={styles.dropdownText}>
                  {selectedStation ? selectedStation.name : 'Select Station'} ▼
                </Text>
              </TouchableOpacity>
            </View>

            {selectedStation && (
              <View style={styles.stationInfo}>
                <Text style={styles.stationName}>{selectedStation.name}</Text>
                <Text style={styles.stationSubtext}>({selectedStation.stationCode})</Text>
                <Text style={styles.stationDepth}>💧 {selectedStation.latestDepth.toFixed(2)}m</Text>
                <Text style={styles.stationDate}>📅 {new Date(selectedStation.latestTime).toLocaleDateString()}</Text>
                <Text style={styles.stationLocation}>🏷️ {selectedStation.district}</Text>
                <Text style={styles.stationCount}>
                  📊 {availableStations.length} stations in district
                </Text>
              </View>
            )}
          </View>

          <View style={styles.eventsPanel}>
            <Text style={styles.sectionTitle}>📋 EVENTS</Text>
            <View style={styles.eventsList}>
              {events.map((event, index) => (
                <TouchableOpacity key={index} style={styles.eventItem}>
                  <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                  <View style={styles.eventContent}>
                    <Text style={styles.eventType}>{event.type}</Text>
                    <Text style={styles.eventDate}>({event.date})</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* District Picker Modal */}
      <Modal
        visible={showDistrictPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDistrictPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowDistrictPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select District</Text>
            <FlatList
              data={[{ id: null, name: 'All Districts' }, ...getDistrictsWithData()]}
              keyExtractor={(item) => item.id || 'all'}
              renderItem={({ item }) => {
                const isSelected = selectedDistrictId === item.id;
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.districtOption,
                      isSelected && styles.selectedOption
                    ]}
                    onPress={() => {
                      setSelectedDistrictId(item.id);
                      setShowDistrictPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.districtOptionText,
                      isSelected && styles.selectedOptionText
                    ]}>
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Station Picker Modal */}
      <Modal
        visible={showStationPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStationPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowStationPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select Station {selectedDistrict ? `in ${selectedDistrict.name}` : ''}
            </Text>
            <Text style={styles.modalSubtitle}>
              {availableStations.length} stations available
            </Text>
            <FlatList
              data={availableStations}
              keyExtractor={(item) => item.stationCode}
              renderItem={({ item }) => {
                const isSelected = selectedStation?.stationCode === item.stationCode;
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.stationOption,
                      isSelected && styles.selectedOption
                    ]}
                    onPress={() => {
                      setSelectedStation(item);
                      setShowStationPicker(false);
                    }}
                  >
                    <View style={styles.stationOptionContent}>
                      <Text style={[
                        styles.stationOptionName,
                        isSelected && styles.selectedOptionText
                      ]}>
                        {item.name}
                      </Text>
                      <Text style={styles.stationOptionCode}>
                        {item.stationCode}
                      </Text>
                      <Text style={styles.stationOptionDepth}>
                        💧 {item.latestDepth.toFixed(2)}m bgl
                      </Text>
                    </View>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              maxHeight={400}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBtnText: {
    fontSize: 14,
    color: '#475569',
  },
  scrollView: {
    flex: 1,
  },
  controlsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    minWidth: 80,
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: '#374151',
  },
  compareBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compareBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  detailsBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  detailsBtnText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    minHeight: 300,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  zoomBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  zoomBtnActive: {
    backgroundColor: '#3B82F6',
  },
  zoomBtnText: {
    fontSize: 12,
    color: '#64748B',
  },
  zoomBtnTextActive: {
    color: '#FFFFFF',
  },
  bottomSection: {
    flexDirection: 'column',
    gap: 16,
    margin: 16,
    marginTop: 0,
  },
  bottomSectionWide: {
    flexDirection: 'row',
  },
  stationDetails: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stationSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  stationDropdown: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dropdownText: {
    fontSize: 14,
    color: '#374151',
  },
  stationInfo: {
    gap: 6,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  stationSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  stationDepth: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  stationDate: {
    fontSize: 12,
    color: '#64748B',
  },
  stationLocation: {
    fontSize: 12,
    color: '#64748B',
  },
  stationCount: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  stationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#EFF6FF',
  },
  stationOptionContent: {
    flex: 1,
  },
  stationOptionName: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#2563EB',
  },
  stationOptionCode: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  stationOptionDepth: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  districtOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  districtOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  eventsPanel: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    color: '#1E293B',
  },
  eventDate: {
    fontSize: 12,
    color: '#64748B',
  },
  viewAllBtn: {
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: '#3B82F6',
  },
});
