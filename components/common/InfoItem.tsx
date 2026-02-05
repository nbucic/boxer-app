import { Platform } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Href, Link } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import clsx from 'clsx';

type InfoItemProps = { icon: LucideIcon; className?: string } & (
  | {
      text: string;
    }
  | {
      link: Href;
      linkText: string;
    }
);

export const InfoItem = (props: InfoItemProps) => {
  const { className, icon } = props;
  let innerElement: ReactNode;

  if ('text' in props) {
    const { text } = props;
    innerElement = (
      <Text
        className={clsx(
          'flex-1 text-xs font-medium whitespace-nowrap overflow-hidden overflow-ellipsis',
          'text-typography-500',
          className
        )}
        {...(Platform.OS === 'android' ? { numberOfLines: 1 } : undefined)}
        {...(Platform.OS === 'android' ? { ellipsizeMode: 'tail' } : undefined)}
      >
        {text}
      </Text>
    );
  } else {
    const { link, linkText } = props;
    innerElement = (
      <Link href={link} className={'text-xs font-bold text-primary-500'}>
        {linkText}
      </Link>
    );
  }

  return (
    <HStack className={'items-center gap-x-1'}>
      <Icon as={icon} className={'w-3.5 h-3.5 text-typography-400 shrink-0'} />
      {innerElement}
    </HStack>
  );
};
