import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';

// Haptic feedback was removed to simplify UI/UX and avoid unexpected device vibrations.
// If you want to re-enable haptics in the future, add a feature flag and re-import expo-haptics.
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // No-op haptic behavior in production to keep interactions minimal.
        props.onPressIn?.(ev);
      }}
    />
  );
}
