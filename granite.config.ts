import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'dailydo',
  plugins: [
    appsInToss({
      brand: {
        displayName: '오늘의 미션',
        primaryColor: '#6C5CE7',
        icon: '',
      },
      permissions: [],
    }),
  ],
});
