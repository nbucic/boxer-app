import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import './global.css';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, StatusBar } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      void NavigationBar.setVisibilityAsync('hidden');
      void NavigationBar.setBehaviorAsync('inset-swipe');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider>
          <StatusBar hidden={true} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!!session}>
              <Stack.Screen name={'(tabs)'} />
              <Stack.Screen name={'modal/editBox'} />
              <Stack.Screen name={'modal/editLocation'} />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
              <Stack.Screen name="(auth)/auth" />
            </Stack.Protected>
          </Stack>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
