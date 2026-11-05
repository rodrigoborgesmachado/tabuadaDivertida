import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.sunsalesystem.tabuadadivertida',
  appName: 'Tabuada Divertida',
  webDir: 'build-app',
  backgroundColor: '#fff7d7',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#fff7d7',
      showSpinner: false,
    },
  },
};

export default config;
