import { ActivityIndicator, Text, View } from 'react-native';

type DataLoaderProps = {
  text?: string;
};

export const DataLoader = (props: DataLoaderProps) => {
  return (
    <View
      className={'flex-1 justify-center items-center bg-background-0 gap-y-2'}
    >
      <ActivityIndicator size="large" className={'primary-500'} />
      <Text className={'text-typography-500'}>{props.text}</Text>
    </View>
  );
};
