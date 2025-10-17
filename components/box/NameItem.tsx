import { HStack } from '@/components/ui/hstack';
import { InboxIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export const NameItem = ({
  boxName,
  containerClassName,
  iconColor,
  isTextWhite = false,
}: {
  boxName: string;
  containerClassName: string;
  iconColor?: string;
  isTextWhite?: boolean;
}) => (
  <HStack className={containerClassName}>
    <Icon as={InboxIcon} color={iconColor} size={'md'} />
    <Text
      className={`flex-1 text-lg font-medium whitespace-nowrap overflow-hidden overflow-ellipsis ${
        isTextWhite ? 'text-white' : ''
      }`}
      numberOfLines={1}
      ellipsizeMode={'tail'}
    >
      {boxName}
    </Text>
  </HStack>
);
