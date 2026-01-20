import { ReactNode } from 'react';
import { View } from 'react-native';
import clsx from 'clsx';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  viewSpace?: 'xl' | 'md';
  title?: string;
}

export const GlassCard = ({
  children,
  className,
  noPadding = false,
  viewSpace = 'xl',
  title,
}: GlassCardProps) => (
  <View
    className={clsx(
      className,
      'bg-background-50 rounded-xl border border-outline-100 shadow-sm',
      !noPadding && 'p-6'
    )}
  >
    <VStack space={viewSpace}>
      {title && (
        <Heading
          size={'xs'}
          className={'text-typography-500 uppercase tracking-widest'}
        >
          {title}
        </Heading>
      )}
      {children}
    </VStack>
  </View>
);
