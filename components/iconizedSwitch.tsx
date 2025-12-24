import { TouchableOpacity } from 'react-native';
import { GridIcon, ListIcon } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import clsx from 'clsx';

export const IconizedSwitch = (props: {
  layout: string;
  onSwitchLeft: () => void;
  onSwitchRight: () => void;
}) => (
  <HStack className="p-1">
    <TouchableOpacity
      onPress={props.onSwitchLeft}
      className={clsx(
        'p-1 rounded-md transition-colors',
        props.layout === 'list' && 'bg-white shadow dark:bg-gray-700',
        props.layout !== 'list' && 'hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      <ListIcon className={'w-5 h-5 text-gray-700 dark:text-gray-300'} />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={props.onSwitchRight}
      className={clsx(
        'p-1 rounded-md transition-colors',
        props.layout === 'grid' && 'bg-white shadow dark:bg-gray-700',
        props.layout !== 'grid' && 'hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      <GridIcon className={'w-5 h-5 text-gray-700 dark:text-gray-300'} />
    </TouchableOpacity>
  </HStack>
);
