import { HStack } from '@/components/ui/hstack';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import clsx from 'clsx';

interface FormActionsProps {
  onSave: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isPending: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitFlex?: number;
}

export const FormActions = ({
  onSave,
  onCancel,
  saveLabel = 'Create',
  cancelLabel = 'Cancel',
  isPending,
  isDirty,
  submitFlex = 2,
}: FormActionsProps) => {
  return (
    <HStack space={'md'} className={'justify-end'}>
      {/* CANCEL button */}
      {onCancel && (
        <Button
          variant={'outline'}
          size={'lg'}
          className={'flex-1 border-outline-200 rounded'}
          onPress={onCancel}
          disabled={isPending}
        >
          <ButtonText className={'text-typography-600'}>
            {cancelLabel}
          </ButtonText>
        </Button>
      )}

      {/* SAVE button */}
      <Button
        size={'lg'}
        style={{ flex: submitFlex }}
        className={clsx(
          'rounded',
          !isDirty || isPending ? 'bg-background-200' : 'bg-primary-500'
        )}
        onPress={onSave}
        isDisabled={!isDirty || isPending}
      >
        {isPending ? (
          <ButtonSpinner color={'white'} />
        ) : (
          <ButtonText className={'font-bold text-white'}>
            {saveLabel}
          </ButtonText>
        )}
      </Button>
    </HStack>
  );
};
