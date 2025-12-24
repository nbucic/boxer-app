import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { ReactNode } from 'react';

export const EmptyList = ({ content }: { content: string | ReactNode }) => {
  return (
    <View
      className={
        'flex flex-col items-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 mx-6 mt-10'
      }
    >
      {typeof content === 'string' ? (
        <Text className={'text-lg'}>{content}</Text>
      ) : (
        content
      )}
    </View>
  );
};
