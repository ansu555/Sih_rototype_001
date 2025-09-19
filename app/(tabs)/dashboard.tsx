import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import GISMap from '@/components/GISMap';
import { useDashboard } from '@/hooks/useDashboard';
import { useDistrictSelection } from '@/contexts/DistrictSelectionContext';
import { useGroundwater } from '@/contexts/GroundwaterContext';

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const toggleMapFullscreen = () => setMapFullscreen(f => !f);
  const mapHeight = Math.min(Math.max(width * 0.55, 320), 540);
  const { state: { menuOpen, stationData }, actions: { toggleMenu, onLogout } } = useDashboard();
  const { districts, selectedDistrictId, setSelectedDistrictId, selectedDistrict } = useDistrictSelection();
  const { stations, refresh } = useGroundwater();

  const [metrics, setMetrics] = useState({
    overallStatus: { status: 'LOADING', safe: 0, warning: 0, critical: 0 },
    criticalDistricts: { count: 0, total: 0 },
    trend: { value: 0, direction: '→' },
    avgDepth: { value: 0, status: 'Unknown' },
    stations: { active: 0, total: 0 },
    anomalies: { count: 0 }
  });

  useEffect(() => {
    if (stations && stations.length > 0) {
      calculateMetrics();
    }
  }, [stations, selectedDistrictId]);

  const calculateMetrics = () => {
    if (!stations || stations.length === 0) {
      console.log('No station data available');
      return;
    }

    console.log('Selected district ID:', selectedDistrictId);
    console.log('Available stations:', stations.length);
    console.log('Sample station:', stations[0]);
    
    const filteredStations = selectedDistrictId 
      ? stations.filter(station => {
          // Find the selected district object to get its name
          const selectedDistrictObj = districts.find(d => d.id === selectedDistrictId);
          const selectedDistrictName = selectedDistrictObj?.name;
          
          // Match by district name
          return station.district === selectedDistrictName;
        })
      : stations;

    console.log('Filtered stations:', filteredStations.length, 'for district', selectedDistrictId);

    if (filteredStations.length === 0) {
      setMetrics({
        overallStatus: { status: 'NO DATA', safe: 0, warning: 0, critical: 0 },
        criticalDistricts: { count: 0, total: districts.length },
        trend: { value: 0, direction: '→' },
        avgDepth: { value: 0, status: 'No Data' },
        stations: { active: 0, total: 0 },
        anomalies: { count: 0 }
      });
      return;
    }

    // Use latestDepth property from the actual data structure
    const safe = filteredStations.filter(s => s.latestDepth && s.latestDepth < 5).length;
    const warning = filteredStations.filter(s => s.latestDepth && s.latestDepth >= 5 && s.latestDepth < 10).length;
    const critical = filteredStations.filter(s => s.latestDepth && s.latestDepth >= 10).length;
    
    const validDepths = filteredStations.filter(s => s.latestDepth && !isNaN(s.latestDepth));
    const avgDepth = validDepths.length > 0 
      ? validDepths.reduce((sum, s) => sum + s.latestDepth, 0) / validDepths.length 
      : 0;
    
    // All stations are considered active if they have recent data
    const activeStations = filteredStations.filter(s => s.status !== 'INACTIVE').length;
    
    // Simple anomaly detection - depths > 2 standard deviations from mean
    const depths = validDepths.map(s => s.latestDepth);
    const mean = depths.reduce((a,b) => a+b, 0) / depths.length;
    const variance = depths.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / depths.length;
    const std = Math.sqrt(variance) || 1;
    const anomalies = filteredStations.filter(s => {
      const z = Math.abs((s.latestDepth - mean) / std);
      return z >= 2;
    }).length;

    const newMetrics = {
      overallStatus: {
        status: critical > 0 ? 'CRITICAL' : warning > 0 ? 'WARNING' : 'GOOD',
        safe,
        warning,
        critical
      },
      criticalDistricts: {
        count: critical,
        total: districts.length
      },
      trend: {
        value: 0.3, // Mock trend for now
        direction: '↓' as const
      },
      avgDepth: {
        value: avgDepth,
        status: avgDepth < 5 ? 'Good' : avgDepth < 10 ? 'Moderate' : 'Critical'
      },
      stations: {
        active: activeStations,
        total: filteredStations.length
      },
      anomalies: {
        count: anomalies
      }
    };

    console.log('New metrics:', newMetrics);
    setMetrics(newMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD': return '#4CAF50';
      case 'WARNING': return '#FF9800';
      case 'CRITICAL': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <View style={styles.page}>
      {mapFullscreen ? (
        <View style={styles.fullscreenContainer}> 
          <GISMap stations={stationData} fullscreen onToggleFullscreen={toggleMapFullscreen} />
        </View>
      ) : (
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Map Section at Top */}
          <View style={styles.mapSection}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>Spatial Distribution</Text>
              <TouchableOpacity 
                style={styles.fullscreenBtn} 
                onPress={toggleMapFullscreen}
              >
                <Text style={styles.fullscreenIcon}>⛶</Text>
              </TouchableOpacity>
            </View>
            <GISMap stations={stationData} height={mapHeight} onToggleFullscreen={toggleMapFullscreen} />
          </View>

          {/* Quick Metrics Section */}
          <View style={styles.metricsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
              <TouchableOpacity 
                style={styles.districtSelector}
                onPress={() => setShowDistrictPicker(true)}
              >
                <Text style={styles.districtText}>
                  {selectedDistrict?.name || 'All Districts'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.metricsGrid}>
              <MetricCard 
                icon="📊" 
                title="OVERALL STATUS" 
                value={`${metrics.overallStatus.status === 'GOOD' ? '🟢' : metrics.overallStatus.status === 'WARNING' ? '🟡' : '🔴'} ${metrics.overallStatus.status}`}
                subtitle={`${metrics.overallStatus.safe} Safe • ${metrics.overallStatus.warning} Warning • ${metrics.overallStatus.critical} Critical`}
                color={getStatusColor(metrics.overallStatus.status)}
              />
              <MetricCard 
                icon="⚠️" 
                title="CRITICAL DISTRICTS" 
                value={`${metrics.criticalDistricts.count}/${metrics.criticalDistricts.total}`}
                subtitle="Districts need attention"
                color={metrics.criticalDistricts.count > 0 ? '#F44336' : '#4CAF50'}
              />
              <MetricCard 
                icon="📈" 
                title="TREND" 
                value={`${metrics.trend.direction} ${metrics.trend.value.toFixed(1)}m`}
                subtitle="Monthly change"
                color={metrics.trend.direction === '↓' ? '#F44336' : metrics.trend.direction === '↑' ? '#FF9800' : '#4CAF50'}
              />
              <MetricCard 
                icon="🏭" 
                title="AVG DEPTH" 
                value={`${metrics.avgDepth.value.toFixed(1)}m`}
                subtitle={`Below ground level • ${metrics.avgDepth.status}`}
                color={getStatusColor(metrics.avgDepth.status.toUpperCase())}
              />
              <MetricCard 
                icon="📍" 
                title="STATIONS" 
                value={`${metrics.stations.active}/${metrics.stations.total}`}
                subtitle={`${((metrics.stations.active / metrics.stations.total) * 100).toFixed(0)}% Active`}
                color={metrics.stations.active / metrics.stations.total > 0.8 ? '#4CAF50' : '#F44336'}
              />
              <MetricCard 
                icon="🚨" 
                title="ANOMALIES" 
                value={metrics.anomalies.count.toString()}
                subtitle={metrics.anomalies.count > 0 ? 'Require investigation' : 'All systems normal'}
                color={metrics.anomalies.count > 0 ? '#F44336' : '#4CAF50'}
              />
            </View>
          </View>

          {/* Alerts & Information */}
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.alertsGrid}>
              <AlertPanel title="🚨 Recent Alerts" urgent>
                <Text style={styles.alertText}>• High drawdown at Well #A12</Text>
                <Text style={styles.alertText}>• Rapid recharge anomaly at Site 7</Text>
                <Text style={styles.alertText}>• Salinity threshold exceeded in Block 3</Text>
              </AlertPanel>
              <InfoPanel title="📊 Data Quality" status="good">
                <Text style={styles.infoText}>✓ 94% data completeness</Text>
                <Text style={styles.infoText}>✓ All sensors calibrated</Text>
                <Text style={styles.infoText}>⚠ 2 stations offline</Text>
              </InfoPanel>
              <InfoPanel title="🔧 Maintenance" status="scheduled">
                <Text style={styles.infoText}>• Site A12: Tomorrow 10:00 AM</Text>
                <Text style={styles.infoText}>• Site B07: Next week</Text>
                <Text style={styles.infoText}>• Calibration due: 3 stations</Text>
              </InfoPanel>
            </View>
          </View>
        </ScrollView>
      )}
      
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
              data={[{ id: null, name: 'All Districts' }, ...districts]}
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
    </View>
  );
}

function MetricCard({ icon, title, value, subtitle, color }: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );
}

function AlertPanel({ title, children, urgent }: { 
  title: string; 
  children: React.ReactNode; 
  urgent?: boolean;
}) {
  return (
    <View style={[styles.alertPanel, urgent && styles.urgentPanel]}>
      <Text style={[styles.alertTitle, urgent && styles.urgentTitle]}>{title}</Text>
      <View style={styles.alertBody}>{children}</View>
    </View>
  );
}

function InfoPanel({ title, children, status }: { 
  title: string; 
  children: React.ReactNode; 
  status: 'good' | 'warning' | 'scheduled';
}) {
  const statusColors = {
    good: '#4CAF50',
    warning: '#FF9800',
    scheduled: '#2196F3'
  };
  
  return (
    <View style={[styles.infoPanel, { borderLeftColor: statusColors[status] }]}>
      <Text style={styles.infoTitle}>{title}</Text>
      <View style={styles.infoBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  scrollContent: { 
    paddingBottom: 100 
  },
  mapSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  fullscreenBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  fullscreenIcon: {
    fontSize: 16,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  districtSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  districtText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#64748B',
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
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
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
  selectedOption: {
    backgroundColor: '#EFF6FF',
  },
  districtOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  metricsSection: {
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    alignItems: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
  alertsSection: {
    marginBottom: 16,
  },
  alertsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  alertPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentPanel: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  urgentTitle: {
    color: '#DC2626',
  },
  alertBody: {
    gap: 6,
  },
  alertText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  infoBody: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  fullscreenContainer: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
});

