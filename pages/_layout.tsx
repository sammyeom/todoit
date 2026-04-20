import React, { type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { TDSProvider } from '@toss/tds-react-native';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <TDSProvider colorPreference="light">
      <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
        {children}
      </View>
    </TDSProvider>
  );
}
