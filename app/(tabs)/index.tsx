import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className={'mb-4 text-2xl'}>Welcome!</Text>
      <Button onPress={() => supabase.auth.signOut()}>
        <ButtonText>Sign Out</ButtonText>
      </Button>
    </View>
  );
}
