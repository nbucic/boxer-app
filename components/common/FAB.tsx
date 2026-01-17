import { Button, ButtonIcon } from '@/components/ui/button';
import clsx from 'clsx';
import { AddIcon } from '@/components/ui/icon';

export const FAB = ({ onPress }: { onPress?: () => void }) => {
  return (
    <Button
      className={clsx(
        'absolute bottom-10 right-5 h-16 w-16 rounded-full',
        'bg-primary-500 shadow-lg active:bg-primary-600 data-[active=true]:bg-primary-600 hover:bg-primary-600 data-[hover=true]:bg-primary-600',
        'items-center justify-center'
      )}
      onPress={onPress}
    >
      <ButtonIcon as={AddIcon} className={'text-white h-8 w-8'} />
    </Button>
  );
};
