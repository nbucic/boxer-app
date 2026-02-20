import { ReactElement, ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RefreshControlProps } from 'react-native';
import { Box } from '@/components/ui/box';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

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

  return (
    <Box
      className={'flex-1 bg-background-0'}
      style={{ paddingTop: insets.top }}
    >
      {header}
      <Box
        className={clsx(
          'flex-1 bg-background-0',
          !noPadding && 'px-6',
          extraClasses?.contentView
        )}
      >
        {scrollable ? (
          <KeyboardAwareScrollView
            className={clsx(extraClasses?.scrollableView)}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            automaticallyAdjustKeyboardInsets={true}
            keyboardDismissMode={'on-drag'}
            refreshControl={refreshControl}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : (
          <Box
            className={clsx('flex-1', extraClasses?.scrollableView)}
            style={{ paddingBottom: insets.bottom }}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
};
