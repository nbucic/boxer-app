import { Button, ButtonText } from '@/components/ui/button';
import clsx from 'clsx';

export default function Fab({ onPress }: { onPress?: () => void }) {
  return (
    <Button
      className={clsx(
        'absolute bottom-20 right-5 h-16 w-16 rounded-full',
        // Primary Styling & Elevation:
        'bg-blue-600 shadow-xl', // Use a deeper blue for impact and a strong shadow
        // Hover State (Web):
        'data-[hover=true]:bg-blue-700' // Darken on hover for clear feedback
      )}
      onPress={onPress}
    >
      <ButtonText
        className={clsx(
          // Text Color: Must be stark white for contrast against blue-600
          'text-4xl font-light text-white',
          // Hover State (Text should remain white or adjust slightly):
          'data-[hover=true]:text-white'
        )}
      >
        +
      </ButtonText>
    </Button>
  );
}
