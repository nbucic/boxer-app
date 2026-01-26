import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react-native';
import { Href, router } from 'expo-router';

interface EmptyListProps {
  title: string;
  subtitle?: string;
  titleIcon?: LucideIcon;
  linkLocation: Href;
  linkCallToAction: string;
  topMargin?: boolean;
}
export const EmptyList = ({
  title,
  subtitle,
  titleIcon,
  linkLocation,
  linkCallToAction,
  topMargin = true,
}: EmptyListProps) => {
  return (
    <View
      className={clsx(
        'flex flex-col items-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 mx-6',
        topMargin && 'mt-10'
      )}
    >
      <Icon as={titleIcon} className={'w-12 h-12 text-blue-500 mb-4'} />
      <Text
        className={
          'text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2'
        }
      >
        {title}
      </Text>
      <Text
        className={
          'text-base text-gray-500 dark:text-gray-400 mb-6 text-center'
        }
      >
        {subtitle}
      </Text>
      <TouchableOpacity
        onPress={() => router.push(linkLocation)}
        className={
          'px-6 py-3 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors'
        }
      >
        <Text className={'text-lg font-medium text-white'}>
          {linkCallToAction}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
