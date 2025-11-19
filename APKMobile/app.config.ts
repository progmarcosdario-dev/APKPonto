import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Scopum - Controle de Ponto',
  slug: 'scopum-ponto',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'scopum',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.scopum.ponto',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#2563eb',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    package: 'com.scopum.ponto',
  },
  plugins: [
    'expo-router',
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
