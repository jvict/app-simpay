import React from 'react';
import { Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../tamagui.config'; 
import { useAuthStore } from '../src/features/auth/store/auth.store';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native'; 
import { YStack } from 'tamagui'; 
import { SplashScreen } from 'expo-router'; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    restoreSession().finally(() => {
        SplashScreen.hideAsync(); 
    });
  }, []);

  if (isLoadingAuth) {
    return (
        <TamaguiProvider config={config}>
            <Theme name="light">
                <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$backgroundLight">
                    <ActivityIndicator size="large" color="$color" />
                </YStack>
            </Theme>
        </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider config={config}>
      <Theme name="light">
        <Stack>
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </Theme>
    </TamaguiProvider>
  );
}