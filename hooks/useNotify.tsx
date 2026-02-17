import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';

export const useNotify = () => {
  const toast = useToast();

  const notify = ({
    title,
    description,
    action = 'success',
  }: {
    title: string;
    description?: string;
    action?: 'success' | 'error' | 'warning' | 'info' | 'muted';
  }) => {
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast
          nativeID={id}
          action={action}
          variant={'solid'}
          className={'rounded-xl shadow-lg'}
        >
          <VStack space={'xs'}>
            <ToastTitle className={'text-typography-0 font-bold'}>
              {title}
            </ToastTitle>
            {description && (
              <ToastDescription className={'text-typography-0'}>
                {description}
              </ToastDescription>
            )}
          </VStack>
        </Toast>
      ),
    });
  };

  return {
    success: (title: string, description?: string) =>
      notify({ title, description, action: 'success' }),
    error: (title: string, description?: string) =>
      notify({ title, description, action: 'error' }),
    warn: (title: string, description?: string) =>
      notify({ title, description, action: 'warning' }),
  };
};
