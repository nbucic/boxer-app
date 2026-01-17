import { ReactNode } from 'react';
import { View } from 'react-native';
import clsx from 'clsx';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  viewSpace?: 'xl' | 'md';
  title?: string;
}

export const GlassCard = ({
  children,
  className,
  viewSpace = 'xl',
  title,
}: GlassCardProps) => (
  <View
    className={clsx(
      'bg-background-50 p-6 rounded-xl border border-outline-100 shadow-sm',
      className
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
