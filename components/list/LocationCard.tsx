import { ScrollTextIcon } from 'lucide-react-native';
import { Location } from '@/types/location';
import { ListView, SwipeableProps } from '@/components/list/view/ListView';
import { NameItem } from '@/components/box/NameItem';
import { VStack } from '@/components/ui/vstack';
import { InfoItem } from '@/components/box/InfoItem';

type LocationCardProps = {
  item: Location;
} & SwipeableProps;

export const LocationCard = ({ item, swipeProperties }: LocationCardProps) => {
  return (
    <ListView
      item={item}
      itemType={'Location'}
      listType={'swipeable'}
      options={{ showPicture: false }}
      swipeProperties={swipeProperties}
      infotainment={
        <VStack className={'gap-1 px-2 h-14 justify-between'}>
          <NameItem name={item.name} key={'name'} />
          {item.description ? (
            <InfoItem icon={ScrollTextIcon} text={item.description} />
          ) : (
            <InfoItem
              icon={ScrollTextIcon}
              link={{
                pathname: '/location/create',
                params: { id: item.id, focus: 'description' },
              }}
              linkText={'Add description?'}
            />
          )}
        </VStack>
      }
    />
  );
};
