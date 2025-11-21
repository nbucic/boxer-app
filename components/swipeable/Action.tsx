import { LucideIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';

export type ActionItem = {
  onPress: () => void;
  icon: LucideIcon;
  text: string;
  className?: string;
};

type ActionProps = {
  items: ActionItem[];
};

export const Action = ({ items }: ActionProps) => (
  <View className={'flex-row'}>
    <HStack className={'dark:my-0 my-1 dark:border-b dark:border-outline-200'}>
      {items.map((item, index) => (
        <TouchableOpacity
          className={`${item.className} justify-center items-center w-20`}
          key={index}
          onPress={item.onPress}
        >
          <View className={'flex justify-center items-center gap-y-1'}>
            <Icon
              as={item.icon}
              size={'custom'}
              className={'text-typography-0'}
            />
            <Text size="xs" className={'text-typography-0'}>
              {item.text}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </HStack>
  </View>
);
