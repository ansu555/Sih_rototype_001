import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useRouter } from 'expo-router';

export function useLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [fade]);

  const toggleSecure = useCallback(() => setSecure(s => !s), []);

  const onLogin = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use push instead of replace to ensure proper navigation
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, router]);

  return {
    state: { username, password, secure, loading, fade },
    actions: { setUsername, setPassword, toggleSecure, onLogin },
  };
}
