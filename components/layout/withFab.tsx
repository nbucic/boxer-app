import { View } from 'react-native';
import Fab from '@/components/Fab';
import { ReactNode } from 'react';

export default function WithFab({
  children,
  onFabPress,
}: {
  children: ReactNode;
  onFabPress: () => void;
}) {
  return (
    <View className={'flex-1'}>
      {children}
      <Fab onPress={onFabPress} />
    </View>
  );
}
