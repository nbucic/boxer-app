import { Platform, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { RefreshCwIcon } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { IconizedSwitch } from '@/components/iconizedSwitch';
import { Layout } from '@/types';

interface ListHeaderProps {
  title: string;
  refetch?: () => void;
  isRefetching?: boolean;
  layout?: Layout;
  setLayout?: (layout: Layout) => void;
}

export const ListHeader = ({
  title,
  refetch,
  isRefetching,
  layout,
  setLayout,
}: ListHeaderProps) => {
  return (
    <HStack className={'justify-between items-center'}>
      <Text size={'3xl'} className={'p-4'}>
        {title}
      </Text>
      <HStack className="items-center mr-3">
        {Platform.OS === 'web' && refetch && (
          <TouchableOpacity
            onPress={refetch}
            disabled={isRefetching}
            className={'p-2 bg-gray-200 rounded-full'}
          >
            <RefreshCwIcon className={'w-5 h-5 text-gray-700'} />
          </TouchableOpacity>
        )}
        {layout && setLayout && (
          <IconizedSwitch
            onSwitchLeft={() => setLayout('list')}
            layout={layout}
            onSwitchRight={() => setLayout('grid')}
          />
        )}
      </HStack>
    </HStack>
  );
};
