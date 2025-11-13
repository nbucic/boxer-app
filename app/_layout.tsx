import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const queryClient = new QueryClient();

const AppLayout = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className={'flex-1 justify-center items-center'}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
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
  );
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </QueryClientProvider>
  );
}
