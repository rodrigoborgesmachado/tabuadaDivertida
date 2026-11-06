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
    LocalNotifications: {
      smallIcon: 'ic_stat_lembrete',
      iconColor: '#ff7f50',
    },
  },
};

export default config;
