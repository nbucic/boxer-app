import { Button, ButtonText } from '@/components/ui/button';
import clsx from 'clsx';

export default function Fab({ onPress }: { onPress?: () => void }) {
  return (
    <Button
      className={clsx(
        'absolute bottom-10 right-5 h-16 w-16 rounded-full',
        'bg-primary-600 shadow-xl',
        'shadow-primary-100',
        'data-[hover=true]:bg-primary-700'
      )}
      onPress={onPress}
    >
      <ButtonText
        className={clsx(
          'text-4xl font-light text-white',
          'data-[hover=true]:text-white'
        )}
      >
        +
      </ButtonText>
    </Button>
  );
}
