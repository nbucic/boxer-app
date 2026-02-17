import { useCallback, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';

export const useConfirm = () => {
  const [config, setConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    onClose?: () => void;
    isDestructive?: boolean;
    hideConfirm?: boolean;
  }>({ isOpen: false, title: '', message: '' });

  const confirm = (params: {
    title: string;
    message: string;
    onConfirm?: () => void;
    onClose?: () => void;
    isDestructive?: boolean;
    hideConfirm?: boolean;
  }) => {
    setConfig({ ...params, isOpen: true });
  };

  const handleClose = useCallback(() => {
    if (config.onClose) {
      config.onClose();
    }

    setConfig((prev) => ({ ...prev, isOpen: false }));
  }, [config]);

  const ConfirmDialog = () => (
    <AlertDialog isOpen={config.isOpen} onClose={handleClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent className={'rounded-2xl'}>
        <AlertDialogHeader>
          <Heading size={'md'}>{config.title}</Heading>
        </AlertDialogHeader>
        <AlertDialogBody className={'mt-2'}>
          <Text size={'sm'}>{config.message}</Text>
        </AlertDialogBody>
        <AlertDialogFooter className={'mt-5'}>
          <HStack space="md" className="w-full justify-end">
            <Button variant="outline" action="secondary" onPress={handleClose}>
              <ButtonText>{config.hideConfirm ? 'Close' : 'Cancel'}</ButtonText>
            </Button>

            {!config.hideConfirm && (
              <Button
                action={config.isDestructive ? 'negative' : 'primary'}
                onPress={() => {
                  config.onConfirm?.();
                  handleClose();
                }}
              >
                <ButtonText>Confirm</ButtonText>
              </Button>
            )}
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, ConfirmDialog };
};
