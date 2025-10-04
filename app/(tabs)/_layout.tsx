import AppHeader from '@/components/AppHeader';
import FontAwesome from '@expo/vector-icons/FontAwesome'; // Or your preferred icon library
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <Tabs 
        initialRouteName="dashboard"
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#004D99', // Example active color
          tabBarInactiveTintColor: 'gray',
          headerShown: false, // Hide headers to avoid double headers
        })}
      >
      <Tabs.Screen
        name="dashboard" // This will look for app/(tabs)/dashboard.tsx
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <FontAwesome name="tachometer" size={size} color={color} />,
          headerShown: false, // Assuming dashboard has its own header or no header
        }}
      />
      <Tabs.Screen
        name="trends" // This will look for app/(tabs)/trends.tsx
        options={{
          title: 'Trends',
          tabBarIcon: ({ color, size }) => <FontAwesome name="line-chart" size={size} color={color} />,
          // Add headerShown: false if this screen shouldn't have a header
        }}
      />
      <Tabs.Screen
        name="resources" // This will look for app/(tabs)/resources.tsx
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, size }) => <FontAwesome name="book" size={size} color={color} />,
          // Add headerShown: false if this screen shouldn't have a header
        }}
      />
      {/* Hide the default index tab */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
    </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
