import { Platform, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, LucideIcon, RefreshCwIcon } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { IconizedSwitch } from '@/components/iconizedSwitch';
import { Layout } from '@/types';
import { Heading } from '@/components/ui/heading';
import clsx from 'clsx';
import { Icon } from '@/components/ui/icon';
import { router } from 'expo-router';

interface ListHeaderProps {
  title: string;
  subtitle?: string;
  subtitleIcon?: LucideIcon;
  refetch?: () => void;
  isRefetching?: boolean;
  layout?: Layout;
  setLayout?: (layout: Layout) => void;
  showBackButton?: boolean;
}

export const ListHeader = (props: ListHeaderProps) => {
  const {
    title,
    subtitle,
    subtitleIcon,
    refetch,
    isRefetching,
    layout,
    setLayout,
    showBackButton = false,
  } = props;
  return (
    <HStack className={'justify-between items-center px-6 py-4 bg-transparent'}>
      <HStack className={'flex-1 items-center space-x-4 min-w-0'}>
        {showBackButton && (
          <View
            className={
              'rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden p-1'
            }
          >
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.navigate('/')
              }
              activeOpacity={0.7}
              className={clsx(
                'p-1 rounded-md transition-colors',
                'bg-white dark:bg-gray-700',
                'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <ChevronLeft
                className={'w-5 h-5 text-gray-700 dark:text-gray-300'}
              />
            </TouchableOpacity>
          </View>
        )}

        <View className={'flex-1 min-w-0'}>
          <Heading
            size={'xl'}
            className={
              ' text-gray-900 dark:text-white overflow-ellipsis overflow-hidden whitespace-nowrap'
            }
          >
            {title}
          </Heading>
          {subtitle && (
            <HStack className={'items-center gap-x-1'}>
              {subtitleIcon && (
                <Icon
                  as={subtitleIcon}
                  className={
                    'w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 '
                  }
                />
              )}
              <Text
                className={
                  'text-gray-500 dark:text-gray-400 overflow-ellipsis overflow-hidden whitespace-nowrap'
                }
              >
                {subtitle}
              </Text>
            </HStack>
          )}
        </View>

        <HStack className="items-center space-x-2">
          {Platform.OS === 'web' && refetch && (
            <TouchableOpacity
              onPress={refetch}
              disabled={isRefetching}
              className={clsx('p-2 rounded-full transition-colors', {
                'bg-gray-100 text-gray-600 hover:bg-gray-200': !isRefetching,
                'bg-gray-50 text-gray-400': isRefetching,
              })}
            >
              <RefreshCwIcon className={'w-5 h-5'} />
            </TouchableOpacity>
          )}
          {layout && setLayout && (
            <View
              className={
                'rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden'
              }
            >
              <IconizedSwitch
                onSwitchLeft={() => setLayout('list')}
                layout={layout}
                onSwitchRight={() => setLayout('grid')}
              />
            </View>
          )}
        </HStack>
      </HStack>
    </HStack>
  );
};
