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

  const onLogin = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/dashboard');
    }, 800);
  }, [loading, router]);

  return {
    state: { username, password, secure, loading, fade },
    actions: { setUsername, setPassword, toggleSecure, onLogin },
  };
}
