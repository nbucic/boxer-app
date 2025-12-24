import { LucideIcon } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import clsx from 'clsx';

export type ActionItem = {
  onPress: () => void;
  icon: LucideIcon;
  text: string;
  className?: string;
};

type ActionProps = {
  items: ActionItem[];
  place: 'left' | 'right';
};

export const Action = ({ items, place }: ActionProps) => (
  <View className={'flex flex-row justify-start'}>
    <HStack>
      {items.map((item, index) => {
        //TODO: figure out whether it's needed
        const borderRadius =
          index === 0 && (place === 'right' ? 'rounded-r-xl' : 'rounded-l-xl');

        return (
          <TouchableOpacity
            className={clsx(item.className, 'justify-center items-center w-20')}
            key={index}
            onPress={item.onPress}
          >
            <View className={'flex justify-center items-center gap-y-1'}>
              <Icon
                as={item.icon}
                size={'custom'}
                className={'text-typography-0'}
              />
              <Text className={'text-base text-white'}>{item.text}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </HStack>
  </View>
);
