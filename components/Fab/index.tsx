import { Button, ButtonIcon } from '@/components/ui/button';
import { AddIcon } from '@/components/ui/icon';

export default function Fab({ onPress }: { onPress?: () => void }) {
  return (
    <Button
      action="positive"
      className={
        'absolute bottom-20 right-5 h-16 w-16 rounded-full elevation-lg'
      }
      onPress={onPress}
    >
      <ButtonIcon as={AddIcon} className={'h-8 w-8'} />
    </Button>
  );
}
