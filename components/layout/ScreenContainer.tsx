import { ReactElement, ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import clsx from 'clsx';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
  ScrollView,
} from 'react-native';
import { Box } from '@/components/ui/box';

interface ScreenContainerProps {
  children: ReactNode;
  header?: ReactNode;
  scrollable?: boolean;
  extraClasses?: {
    scrollableView?: string;
    contentView?: string;
  };
  noPadding?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
}

export const ScreenContainer = ({
  children,
  header,
  scrollable = true,
  extraClasses,
  noPadding = true,
  refreshControl,
}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();

  const containerClass = clsx(
    'flex-1 bg-background-0',
    !noPadding && 'px-6',
    extraClasses?.contentView
  );

  const content = scrollable ? (
    <ScrollView
      className={clsx('flex-1', extraClasses?.scrollableView)}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      automaticallyAdjustKeyboardInsets={true}
      keyboardDismissMode={'on-drag'}
      refreshControl={refreshControl}
      testID={'scroll-view'}
    >
      {children}
    </ScrollView>
  ) : (
    <Box
      className={clsx('flex-1', extraClasses?.scrollableView)}
      style={{ paddingBottom: insets.bottom }}
    >
      {children}
    </Box>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      className={'flex-1 bg-background-0'}
    >
      {header}
      <Box className={containerClass} style={{ paddingTop: insets.top }}>
        {content}
      </Box>
    </KeyboardAvoidingView>
  );
};
