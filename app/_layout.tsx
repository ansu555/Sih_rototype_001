import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router'; // Import SplashScreen
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react'; // Import useEffect

import { useColorScheme } from '@/hooks/useColorScheme';
import { DistrictSelectionProvider } from '@/contexts/DistrictSelectionContext';
import { GroundwaterProvider } from '@/contexts/GroundwaterContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({ // Capture error state
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) { // Hide splash screen once fonts are loaded or if there's an error
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) { // Only return null if still loading and no error
    return null;
  }

  return (
    <GroundwaterProvider>
      <DistrictSelectionProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false, // Hide header for all stack screens by default
            }}
          >
            {/* The (tabs) layout will be the main navigation now */}
            <Stack.Screen name="(tabs)" /> 
            <Stack.Screen name="+not-found" />
          </Stack>
          {/* Changed to a fixed style for debugging */}
          <StatusBar style="auto" /> 
        </ThemeProvider>
      </DistrictSelectionProvider>
    </GroundwaterProvider>
  );
}
