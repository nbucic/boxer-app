import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import './global.css';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <GluestackUIProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!!session}>
              <Stack.Screen name="(tabs)" />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
              <Stack.Screen name="(auth)/auth" />
            </Stack.Protected>
          </Stack>
        </GluestackUIProvider>
      </QueryClientProvider>
    </SafeAreaView>
  );
}
