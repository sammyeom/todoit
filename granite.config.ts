import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'todoit',
  plugins: [
    appsInToss({
      brand: {
        displayName: '오늘의 미션',
        primaryColor: '#4A9FF5',
        icon: 'https://static.toss.im/appsintoss/33673/3280339c-350e-4049-b6db-8b224fde8a2c.png',
      },
      permissions: [],
    }),
  ],
});
