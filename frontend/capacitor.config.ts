import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartstock.app',
  appName: 'Smart Stock',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;
