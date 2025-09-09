import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

// Simple minimalist gov badge placeholder (can be replaced with actual asset)
function GovBadge() {
  return (
    <View style={styles.badge} accessibilityLabel="Government Badge">
      <Text style={styles.badgeText}>GOV.IN</Text>
    </View>
  );
}

function WaveBackground() {
  // Optimized simple wave path (< 50KB, inline)
  return (
    <Svg
      width="100%"
      height="220"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      style={styles.waveSvg}
    >
      <Defs>
        <SvgLinearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#0090FF" stopOpacity={0.35} />
          <Stop offset="100%" stopColor="#0066CC" stopOpacity={0.15} />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M0 224L48 192C96 160 192 96 288 96C384 96 480 160 576 181.3C672 203 768 181 864 149.3C960 117 1056 75 1152 74.7C1248 75 1344 117 1392 138.7L1440 160V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0Z"
        fill="url(#waveGradient)"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const onLogin = () => {
    // Placeholder auth action
    console.log('Attempt login', { username });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0066CC", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <WaveBackground />
      <GovBadge />
      <View style={styles.centerWrapper}>
        <BlurView intensity={50} tint="light" style={styles.card} experimentalBlurMethod="dimezisBlurView">
          <View style={styles.cardInner}>
            <Text style={styles.title}>DWLR Groundwater Monitoring</Text>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                placeholder="Enter Email/ID"
                placeholderTextColor="#4D7191"
                style={styles.input}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                accessibilityLabel="Username"
              />
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  placeholder="Enter Password"
                  placeholderTextColor="#4D7191"
                  style={[styles.input, styles.passwordInput]}
                  secureTextEntry={secure}
                  value={password}
                  onChangeText={setPassword}
                  accessibilityLabel="Password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setSecure(s => !s)}
                  accessibilityRole="button"
                  accessibilityLabel={secure ? 'Show password' : 'Hide password'}
                >
                  <Text style={styles.eyeText}>{secure ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={onLogin} accessibilityRole="button">
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0066CC' },
  centerWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)'
  },
  cardInner: { padding: 32, gap: 20 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#0066CC', fontFamily: Platform.select({ default: undefined }) },
  fieldWrapper: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#005299' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#00375F',
    borderWidth: 1,
    borderColor: 'rgba(0,102,204,0.25)'
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, paddingRight: 44 },
  eyeButton: { position: 'absolute', right: 10, padding: 8 },
  eyeText: { fontSize: 18 },
  loginButton: {
    backgroundColor: '#0066CC',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0066CC',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  loginButtonText: { color: 'white', fontWeight: '600', fontSize: 16, letterSpacing: 0.5 },
  badge: {
    position: 'absolute',
    top: 48,
    left: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)'
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#004D99', letterSpacing: 1 },
  waveSvg: { position: 'absolute', top: 0, left: 0 },
});
