import { Platform, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronLeft, LucideIcon, RefreshCwIcon } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { IconizedSwitch } from '@/components/iconizedSwitch';
import { Layout } from '@/types';
import { Heading } from '@/components/ui/heading';
import clsx from 'clsx';
import { Icon } from '@/components/ui/icon';
import { RelativePathString, router } from 'expo-router';

interface ListHeaderProps {
  title: string;
  subtitle?: string;
  subtitleIcon?: LucideIcon;
  refetch?: () => void;
  isRefetching?: boolean;
  layout?: Layout;
  setLayout?: (layout: Layout) => void;
  backButton?: boolean | string;
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
    backButton = false,
  } = props;
  const determineBackButtonLinkType = (backButton: string | boolean) => {
    switch (typeof backButton) {
      case 'string':
        return () => router.push(backButton as RelativePathString);
      case 'boolean':
        if (backButton) {
          return () =>
            router.canGoBack() ? router.back() : router.navigate('/');
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const backButtonLink = determineBackButtonLinkType(backButton);

  return (
    <HStack className={'justify-between items-center px-6 py-4 bg-transparent'}>
      <HStack className={'flex-1 items-center gap-4 min-w-0'}>
        {backButtonLink && (
          <View
            className={
              'rounded-lg border border-outline-100 overflow-hidden bg-background-50'
            }
          >
            <TouchableOpacity
              onPress={backButtonLink}
              activeOpacity={0.7}
              className={
                'p-2 bg-background-0 hover:bg-background-100 active:bg-background-100'
              }
            >
              <ChevronLeft className={'w-5 h-5 text-typography-900'} />
            </TouchableOpacity>
          </View>
        )}

        <View className={'flex-1 min-w-0'}>
          <Heading
            size={'xl'}
            className={
              'text-typography-900 leading-tight overflow-ellipsis overflow-hidden whitespace-nowrap'
            }
            {...(Platform.OS === 'android' ? { numberOfLines: 1 } : undefined)}
          >
            {title}
          </Heading>
          {subtitle && (
            <HStack className={'items-center gap-1 mt-0.5'}>
              {subtitleIcon && (
                <Icon
                  as={subtitleIcon}
                  className={'w-3.5 h-3.5 text-typography-400 shrink-0'}
                />
              )}
              <Text
                className={
                  'text-typography-500 text-sm overflow-ellipsis overflow-hidden whitespace-nowrap '
                }
                {...(Platform.OS === 'android'
                  ? { numberOfLines: 1 }
                  : undefined)}
              >
                {subtitle}
              </Text>
            </HStack>
          )}
        </View>

        <HStack className="items-center gap-3">
          {Platform.OS === 'web' && refetch && (
            <TouchableOpacity
              onPress={refetch}
              disabled={isRefetching}
              className={clsx(
                'p-2 rounded-full transition-all',
                isRefetching
                  ? 'opacity-40'
                  : 'bg-background-50 active:bg-background-100 hover:bg-background-100'
              )}
            >
              <RefreshCwIcon className={'w-5 h-5 text-typography-600'} />
            </TouchableOpacity>
          )}

          {layout && setLayout && (
            <View
              className={
                'rounded-lg border border-outline-100 bg-background-50 overflow-hidden'
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
