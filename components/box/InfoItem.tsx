import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Href, Link } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';

type InfoItemProps =
  | {
      icon: LucideIcon;
      text: string;
    }
  | {
      text?: string | null;
      link: Href;
      linkText: string;
    };

export default function InfoItem(props: InfoItemProps) {
  // @ts-ignore
  const { text, link, linkText, icon } = props;
  return (
    <HStack className={'items-center gap-x-1'}>
      <Icon as={icon} />
      {text ? (
        <Text
          className={
            'flex-1 text-sm italic whitespace-nowrap overflow-hidden overflow-ellipsis text-gray-900 dark:text-white'
          }
          numberOfLines={1}
          ellipsizeMode={'tail'}
        >
          {text}
        </Text>
      ) : (
        <Link href={link} className={'border-dashed border-b text-red-300'}>
          {linkText}
        </Link>
      )}
    </HStack>
  );
}
