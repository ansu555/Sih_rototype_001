import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome'; // Or your preferred icon library

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#004D99', // Example active color
        tabBarInactiveTintColor: 'gray',
        // headerShown: false, // Uncomment if you want to hide headers for all tab screens by default
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
    </Tabs>
  );
}
