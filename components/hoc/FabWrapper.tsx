import { View } from 'react-native';
import { FAB } from '@/components/common/FAB';
import { ReactNode } from 'react';

interface FabWrapperProps {
  children: ReactNode;
  onPress: () => void;
}

export default function FabWrapper({ children, onPress }: FabWrapperProps) {
  return (
    <View className={'flex-1 bg-background-0'}>
      {children}
      <FAB onPress={onPress} />
    </View>
  );
}
