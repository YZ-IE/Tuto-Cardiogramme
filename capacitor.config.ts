import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cardiolearn.ecg',
  appName: 'CardioLearn ECG',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
