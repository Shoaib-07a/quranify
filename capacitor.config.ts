import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quranify.app',
  appName: 'Quranify',
  webDir: 'public',
  server: {
    url: 'https://quranify-production.up.railway.app',
  },
};

export default config;