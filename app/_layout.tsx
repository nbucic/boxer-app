import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useInitialTheme } from '@/hooks/useInitialTheme';

const queryClient = new QueryClient();

const AppLayout = () => {
  const { session, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View className={'flex-1 justify-center items-center'}>
        <ActivityIndicator size={'large'} color={'red'} />
      </View>
    );
  }

  return (
    <View className={'flex-1 bg-white dark:bg-black'}>
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
    </View>
  );
};

export default function RootLayout() {
  const { theme } = useInitialTheme();

  return (
    <GluestackUIProvider mode={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
