import { Redirect } from 'expo-router';

export default function DashboardRedirect() {
  return <Redirect href="/(tabs)/dashboard" />;
}
