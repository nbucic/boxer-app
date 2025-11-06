import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

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
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_left',
            statusBarHidden: true,
            navigationBarHidden: true,
          }}
        >
          <Stack.Protected guard={!!session}>
            <Stack.Screen name={'(tabs)'} />
            <Stack.Screen name={'location'} />
            <Stack.Screen name={'box'} />
          </Stack.Protected>

          <Stack.Protected guard={!session}>
            <Stack.Screen name={'(auth)/auth'} />
          </Stack.Protected>
        </Stack>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}
