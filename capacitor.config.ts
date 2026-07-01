import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mapfont',
  appName: 'mapfont',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
