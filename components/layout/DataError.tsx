import { Text, View } from 'react-native';

type DataErrorProps = {
  text?: string;
};

export const DataError = (props: DataErrorProps) => {
  return (
    <View className={'flex-1 justify-center items-center bg-background-0'}>
      <Text className={'text-typography-600'}>{props?.text}</Text>
    </View>
  );
};
