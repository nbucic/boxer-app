import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Box as BoxType } from '@/types/box';
import { Link } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';

export default function InfoItem({
  box,
  icon,
  text,
  linkText,
  focus,
}: {
  box: BoxType;
  icon: LucideIcon;
  text: string | null | undefined;
  linkText: string;
  focus: 'location' | 'description';
}) {
  return (
    <HStack className={'items-center gap-x-1'}>
      <Icon as={icon} />
      {text ? (
        <Text
          className={
            'flex-1 text-sm text-typography-500 italic whitespace-nowrap overflow-hidden overflow-ellipsis'
          }
          numberOfLines={1}
          ellipsizeMode={'tail'}
        >
          {text}
        </Text>
      ) : (
        <Link
          href={{
            pathname: '/box/create',
            params: { id: box.id, focus },
          }}
          className={'border-dashed border-b text-red-300'}
        >
          {linkText}
        </Link>
      )}
    </HStack>
  );
}
