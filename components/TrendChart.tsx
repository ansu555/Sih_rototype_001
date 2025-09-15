import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  Dimensions, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  FlatList
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useDistrictSelection } from '@/contexts/DistrictSelectionContext';
import { GroundwaterReading } from '@/data/groundwater';

const screenWidth = Dimensions.get('window').width;

// District name mapping between JSON file names and data district names
const DISTRICT_MAPPING: { [key: string]: string } = {
  'Bankura': 'BANKURA',
  'Birbhum': 'BIRBHUM', 
  'Purba Bardhaman': 'BARDDHAMAN',
  'Nadia': 'NADIA',
  'Cooch Behar': 'COOCH BEHAR'
};

interface TimeInterval {
  startMonth: number;
  endMonth: number;
  year: number;
  label: string;
}

interface ProcessedData {
  intervals: TimeInterval[];
  chartData: {
    labels: string[];
    datasets: {
      data: number[];
      color: (opacity?: number) => string;
      strokeWidth: number;
    }[];
  };
}

export default function TrendChart() {
  const { selectedDistrict } = useDistrictSelection();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get all raw groundwater readings for the selected district or all West Bengal
  const districtReadings = useMemo(() => {
    // Import raw data files
    const rawData: GroundwaterReading[] = [];
    
    // Load data from all district files
    try {
      // @ts-ignore
      const bankuraRaw = require('../assets/data/GWL/Bankura/GWATERLVL (1).json');
      // @ts-ignore
      const barddhamanRaw = require('../assets/data/GWL/Barddhaman/GWATERLVL (1).json');
      // @ts-ignore
      const birbhumRaw = require('../assets/data/GWL/Birbhum/GWATERLVL.json');
      // @ts-ignore
      const coochBeharRaw = require('../assets/data/GWL/Cooch Behar/GWATERLVL.json');
      // @ts-ignore
      const nadiaRaw = require('../assets/data/GWL/Nadia/GWATERLVL.json');
      
      const allRawData = [bankuraRaw, barddhamanRaw, birbhumRaw, coochBeharRaw, nadiaRaw];
      
      allRawData.forEach(group => {
        if (Array.isArray(group)) {
          group.forEach((reading: GroundwaterReading) => {
            if (selectedDistrict) {
              // Filter by selected district
              const expectedDistrictName = DISTRICT_MAPPING[selectedDistrict.name] || selectedDistrict.name.toUpperCase();
              if (reading.district === expectedDistrictName) {
                rawData.push(reading);
              }
            } else {
              // Include all West Bengal data when no district is selected
              const westBengalDistricts = Object.values(DISTRICT_MAPPING);
              if (westBengalDistricts.includes(reading.district)) {
                rawData.push(reading);
              }
            }
          });
        }
      });
    } catch (error) {
      console.warn('Error loading groundwater data:', error);
    }
    
    return rawData;
  }, [selectedDistrict]);

  // Get available years from the data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    districtReadings.forEach(reading => {
      years.add(reading.dataTime.year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [districtReadings]);

  // Process data into 6-month intervals
  const processedData = useMemo((): ProcessedData => {
    if (districtReadings.length === 0) {
      return {
        intervals: [],
        chartData: {
          labels: [],
          datasets: [{ data: [], color: () => '#0066CC', strokeWidth: 2 }]
        }
      };
    }

    // Filter data by selected year (or use all data if 'all' is selected)
    const yearData = selectedYear === 'all' 
      ? districtReadings 
      : districtReadings.filter(reading => reading.dataTime.year === selectedYear);
    
    if (yearData.length === 0) {
      return {
        intervals: [],
        chartData: {
          labels: [],
          datasets: [{ data: [], color: () => '#0066CC', strokeWidth: 2 }]
        }
      };
    }

    // Create intervals based on whether we're showing all years or a specific year
    let intervals: TimeInterval[];
    
    if (selectedYear === 'all') {
      // For all years, create a single interval that shows all years
      // This prevents overcrowding by showing aggregated yearly data
      const years = Array.from(new Set(yearData.map(reading => reading.dataTime.year))).sort();
      if (years.length > 0) {
        intervals = [{
          startMonth: 1,
          endMonth: 12,
          year: years[0], // Use first year as reference, but we'll show all years
          label: 'All Years'
        }];
      } else {
        intervals = [];
      }
    } else {
      // For specific year, create 6-month intervals
      intervals = [
        { startMonth: 1, endMonth: 6, year: selectedYear, label: 'Jan-Jun' },
        { startMonth: 7, endMonth: 12, year: selectedYear, label: 'Jul-Dec' }
      ];
    }


    // Get data for the current interval
    const currentInterval = intervals[currentIntervalIndex];
    let intervalReadings;
    
    if (selectedYear === 'all') {
      // For all years view, use all the data (no filtering by year/month)
      intervalReadings = yearData;
    } else {
      // For specific year view, filter by the current interval
      intervalReadings = yearData.filter(reading => {
        const month = reading.dataTime.monthValue;
        const year = reading.dataTime.year;
        return month >= currentInterval.startMonth && 
               month <= currentInterval.endMonth && 
               year === currentInterval.year;
      });
    }

    let labels: string[] = [];
    let data: number[] = [];

    if (selectedYear === 'all') {
      // For all years view, show yearly aggregated data instead of monthly
      // This prevents layout disruption by reducing the number of data points
      const yearGroups: { [key: number]: number[] } = {};
      intervalReadings.forEach(reading => {
        const year = reading.dataTime.year;
        if (!yearGroups[year]) yearGroups[year] = [];
        yearGroups[year].push(reading.dataValue);
      });

      // Sort years and create labels and data
      const sortedYears = Object.keys(yearGroups).map(Number).sort();
      
      sortedYears.forEach(year => {
        labels.push(year.toString());
        const avg = yearGroups[year].reduce((sum, val) => sum + val, 0) / yearGroups[year].length;
        data.push(Math.round(avg * 10) / 10);
      });
    } else {
      // For specific year view, show monthly data within the 6-month interval
      const monthGroups: { [key: number]: number[] } = {};
      intervalReadings.forEach(reading => {
        const month = reading.dataTime.monthValue;
        if (!monthGroups[month]) monthGroups[month] = [];
        monthGroups[month].push(reading.dataValue);
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let month = currentInterval.startMonth; month <= currentInterval.endMonth; month++) {
        labels.push(monthNames[month - 1]);
        if (monthGroups[month]) {
          const avg = monthGroups[month].reduce((sum, val) => sum + val, 0) / monthGroups[month].length;
          data.push(Math.round(avg * 10) / 10);
        } else {
          data.push(0);
        }
      }
    }

    return {
      intervals,
      chartData: {
        labels,
        datasets: [{
          data,
          color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
          strokeWidth: 2,
        }]
      }
    };
  }, [districtReadings, selectedYear, currentIntervalIndex]);

  const handleIntervalChange = (index: number) => {
    setCurrentIntervalIndex(index);
  };

  const handleYearChange = (year: number | 'all') => {
    setSelectedYear(year);
    setCurrentIntervalIndex(0); // Reset to first interval
    setShowYearPicker(false);
  };

  if (!selectedDistrict) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Groundwater Level Trends (m)</Text>
          <Text style={styles.districtName}>West Bengal (All Districts)</Text>
        </View>

        {/* Year Selection */}
        <View style={[
          styles.controlsContainer,
          selectedYear === 'all' && styles.controlsContainerAllYears
        ]}>
          <TouchableOpacity 
            style={styles.yearButton}
            onPress={() => setShowYearPicker(true)}
          >
            <Text style={styles.yearButtonText}>
              {selectedYear === 'all' ? 'All Years' : `Year: ${selectedYear}`}
            </Text>
          </TouchableOpacity>

          {/* Interval Navigation - Hide for All Years view */}
          {selectedYear !== 'all' && (
            <View style={styles.intervalContainer}>
              {processedData.intervals.map((interval, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.intervalButton,
                    currentIntervalIndex === index && styles.intervalButtonActive
                  ]}
                  onPress={() => handleIntervalChange(index)}
                >
                  <Text style={[
                    styles.intervalButtonText,
                    currentIntervalIndex === index && styles.intervalButtonTextActive
                  ]}>
                    {interval.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Chart */}
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chartContainer}
        >
          <LineChart
            data={processedData.chartData}
            width={selectedYear === 'all' 
              ? Math.max(screenWidth * 0.9, processedData.chartData.labels.length * 80) // Wider spacing for years
              : Math.max(screenWidth * 0.9, processedData.chartData.labels.length * 50) // Normal spacing for months
            }
            height={200}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#0066CC' },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </ScrollView>

        {/* Year Picker Modal */}
        <Modal
          visible={showYearPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowYearPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <FlatList
                data={['all', ...availableYears]}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.yearItem}
                    onPress={() => handleYearChange(item as number | 'all')}
                  >
                    <Text style={styles.yearItemText}>
                      {item === 'all' ? 'All Years' : item.toString()}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowYearPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (districtReadings.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Groundwater Level Trends (m)</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for {selectedDistrict.name}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groundwater Level Trends (m)</Text>
        <Text style={styles.districtName}>{selectedDistrict.name}</Text>
      </View>

      {/* Year Selection */}
      <View style={[
        styles.controlsContainer,
        selectedYear === 'all' && styles.controlsContainerAllYears
      ]}>
        <TouchableOpacity 
          style={styles.yearButton}
          onPress={() => setShowYearPicker(true)}
        >
          <Text style={styles.yearButtonText}>
            {selectedYear === 'all' ? 'All Years' : `Year: ${selectedYear}`}
          </Text>
        </TouchableOpacity>

        {/* Interval Navigation - Hide for All Years view */}
        {selectedYear !== 'all' && (
          <View style={styles.intervalContainer}>
            {processedData.intervals.map((interval, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.intervalButton,
                  currentIntervalIndex === index && styles.intervalButtonActive
                ]}
                onPress={() => handleIntervalChange(index)}
              >
                <Text style={[
                  styles.intervalButtonText,
                  currentIntervalIndex === index && styles.intervalButtonTextActive
                ]}>
                  {interval.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Chart */}
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.chartContainer}
      >
        <LineChart
          data={processedData.chartData}
          width={selectedYear === 'all' 
            ? Math.max(screenWidth * 0.9, processedData.chartData.labels.length * 80) // Wider spacing for years
            : Math.max(screenWidth * 0.9, processedData.chartData.labels.length * 50) // Normal spacing for months
          }
          height={200}
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#0066CC' },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </ScrollView>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year</Text>
            <FlatList
              data={['all', ...availableYears]}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.yearItem}
                  onPress={() => handleYearChange(item as number | 'all')}
                >
                  <Text style={styles.yearItemText}>
                    {item === 'all' ? 'All Years' : item.toString()}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowYearPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D99',
    marginBottom: 4,
  },
  districtName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlsContainerAllYears: {
    justifyContent: 'flex-start', // Center the year button when intervals are hidden
  },
  yearButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  yearButtonText: {
    color: '#1976D2',
    fontWeight: '500',
    fontSize: 14,
  },
  intervalContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  intervalButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  intervalButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  intervalButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    marginBottom: 16,
  },
  noDataContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  yearItemText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
