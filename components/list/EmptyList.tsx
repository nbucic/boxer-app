import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { ReactNode } from 'react';

export const EmptyList = ({ content }: { content: string | ReactNode }) => {
  return (
    <View className={'flex-1 justify-center items-center'}>
      {typeof content === 'string' ? (
        <Text className={'text-lg'}>{content}</Text>
      ) : (
        content
      )}
    </View>
  );
};
