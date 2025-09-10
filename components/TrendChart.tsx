import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [20, 22, 19, 25, 23, 21],
      color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

export default function TrendChart() {
  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#004D99', marginBottom: 8 }}>
        Groundwater Level Trends (m)
      </Text>
      <LineChart
        data={data}
        width={screenWidth * 0.8}
        height={180}
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
    </View>
  );
}
