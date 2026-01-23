import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNewTool, getToolEditData, updateTool } from '@/services/tool';
import { TextInput } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { ImagePickerAsset } from 'expo-image-picker';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ToolFormData } from '@/types/tools';
import { showAlert } from '@/lib/helpers/alert';
import { ListHeader } from '@/components/list/ListHeader';
import { DataLoader } from '@/components/layout/DataLoader';
import { DataError } from '@/components/layout/DataError';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlassCard } from '@/components/layout/GlassCard';
import { FormField } from '@/components/common/FormField';
import { FormActions } from '@/components/form/FormActions';

export default function EditToolScreen() {
  const { id: toolId, boxId } = useLocalSearchParams<{
    id: string;
    boxId?: string;
  }>();
  const queryClient = useQueryClient();
  const isEditMode = !!toolId;
  const descriptionInputRef = useRef<TextInput>(null);

  const {
    data: existingTool,
    isFetching: fetchingExistingTool,
    status,
    error: errorExistingTool,
  } = useQuery({
    queryKey: ['tools', toolId],
    queryFn: () => getToolEditData(toolId!),
    enabled: isEditMode,
  });

  const {
    control,
    formState: { isDirty, isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<ToolFormData>({
    defaultValues: {
      name: '',
      description: '',
      image_url: '',
      box_id: '',
    },
  });

  useEffect(() => {
    if (existingTool) {
      reset(existingTool);
    } else if (boxId) {
      setValue('box_id', boxId, { shouldDirty: false });
    }
  }, [existingTool, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ToolFormData) =>
      isEditMode ? updateTool(toolId!, data) : createNewTool(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tools'] });
      router.dismissAll();
      router.navigate('/');
    },
    onError: (e: Error) => {
      showAlert({
        title: 'Error',
        message: `Failed to ${isEditMode} ? 'update' : 'create'} tool: ${e.message}`,
      });
    },
  });

  const handleImageChange = (image: ImagePickerAsset) => {
    setValue('new_asset', image, { shouldDirty: true });
    setValue('image_url', image.uri, { shouldDirty: true });
  };

  if (fetchingExistingTool) {
    return <DataLoader text={'Inspecting tool information ...'} />;
  }

  if (status === 'error') {
    return (
      <DataError text={`Error fetching tool: ${errorExistingTool.message}`} />
    );
  }

  return (
    <ScreenContainer
      noPadding={false}
      header={
        <ListHeader
          title={`${isEditMode ? 'Edit' : 'New'} tool`}
          subtitle={
            isEditMode
              ? 'Update details for this tool.'
              : 'Add a new tool to the box.'
          }
        />
      }
    >
      <VStack space={'2xl'}>
        <GlassCard>
          <FormField
            control={control}
            name={'image_url'}
            rules={{ required: 'Photo is required' }}
            label={'Tool photo'}
            options={{ handleImageChange, type: 'box' }}
            type={'image'}
          />

          <FormField
            control={control}
            name={'name'}
            label={'Name the tool'}
            placeholder={'Jig saw'}
            rules={{ required: 'Name is required' }}
          />

          <FormField
            control={control}
            name={'box_id'}
            label={'Box'}
            rules={{ required: 'Put the tool in some box 🤷' }}
            options={{ isDisabled: !!boxId }}
            type={'box-dropdown'}
          />

          <FormField
            control={control}
            name={'description'}
            label={'Description (optional)'}
            placeholder={"Briefly describe the tool you're storing..."}
            type={'text-area'}
            fieldRef={descriptionInputRef}
          />
        </GlassCard>

        <FormActions
          onSave={handleSubmit((data) => mutate(data))}
          onCancel={() =>
            router.canGoBack() ? router.back() : router.navigate('/')
          }
          isPending={isPending}
          isValid={isValid}
          isDirty={isDirty}
          saveLabel={isEditMode ? 'Update' : 'Create'}
        />
      </VStack>
    </ScreenContainer>
  );
}
