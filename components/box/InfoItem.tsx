import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Href, Link } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import clsx from 'clsx';
import { ReactNode } from 'react';

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
          'flex-1 whitespace-nowrap overflow-hidden overflow-ellipsis',
          'text-xs text-gray-500 dark:text-gray-400',
          className
        )}
        numberOfLines={1}
        ellipsizeMode={'tail'}
      >
        {text}
      </Text>
    );
  } else {
    const { link, linkText } = props;
    innerElement = (
      <Link
        href={link}
        className={
          'text-xs font-medium text-blue-500 dark:Text-blue-400 underline'
        }
      >
        {linkText}
      </Link>
    );
  }

  return (
    <HStack className={'items-center gap-x-1'}>
      <Icon
        as={icon}
        className={'w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0'}
      />
      {innerElement}
    </HStack>
  );
};
