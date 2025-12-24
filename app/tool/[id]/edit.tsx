import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNewTool, getToolEditData, updateTool } from '@/services/tool';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from 'react-native';
import { VStack } from '@/components/ui/vstack';
import Avatar from '@/components/Avatar';
import { ImagePickerAsset } from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { ToolFormData } from '@/types/tools';
import { showAlert } from '@/lib/helpers/alert';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { AlertCircleIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { HStack } from '@/components/ui/hstack';
import { BoxSearchSelect } from '@/components/form/BoxSearchSelect';
import { ListHeader } from '@/components/list/ListHeader';
import clsx from 'clsx';

export default function EditToolScreen() {
  const { id: toolId, boxId } = useLocalSearchParams<{
    id: string;
    boxId?: string;
  }>();
  const [publicImageUrl, setPublicImageUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isEditMode = !!toolId;

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
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    setValue,
  } = useForm<ToolFormData>({ mode: 'onChange' });

  useEffect(() => {
    if (existingTool) {
      reset(existingTool);
      if (existingTool.image_url) {
        setPublicImageUrl(existingTool.image_url);
      }
    } else if (boxId) {
      setValue('box_id', boxId, { shouldDirty: false });
    }
    // setValue('photo_added', !!existingTool);
  }, [existingTool, reset]);
  // }, [existingTool, boxId, reset()]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ToolFormData) =>
      isEditMode ? updateTool(toolId!, data) : createNewTool(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tools'] });
      router.dismissAll();
      router.navigate('/(tabs)');
    },
    onError: (e: Error) => {
      showAlert({
        title: 'Error',
        message: `Failed to ${isEditMode} ? 'update' : 'create'} tool: ${e.message}`,
      });
    },
  });

  useEffect(() => {
    if (existingTool?.image_url) {
      setPublicImageUrl(existingTool.image_url);
    }
  }, [existingTool?.image_url]);

  const handleImageChange = (image: ImagePickerAsset) => {
    setPublicImageUrl(image.uri);
    setValue('new_tool_asset', image, { shouldDirty: true });
    setValue('photo_added', true);
  };

  const saveTheTool = (formData: ToolFormData) => {
    mutate(formData);
  };

  if (fetchingExistingTool) {
    return (
      <View className={'flex-1 justify-center bg-white dark:bg-black'}>
        <ActivityIndicator size={'large'} color={'#2563eb'} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text>Error fetching tool: {errorExistingTool.message}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={'height'}
      className={'flex-1 bg-white dark:bg-black'}
    >
      <ListHeader
        title={`${isEditMode ? 'Edit' : 'New'} tool`}
        subtitle={
          isEditMode
            ? 'Update details for this tool.'
            : 'Add a new tool to the box.'
        }
      />
      <ScrollView className={'flex-1 px-4 pb-4'}>
        <VStack space={'2xl'}>
          <View
            className={
              'bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800'
            }
          >
            <VStack space={'xl'}>
              <Controller
                control={control}
                name={'photo_added'}
                rules={{ required: 'Photo is required!' }}
                render={() => (
                  <FormControl isInvalid={!!errors.photo_added}>
                    <VStack className={'items-center py-2'} space={'md'}>
                      <Avatar
                        avatarUrl={publicImageUrl}
                        onImageChange={handleImageChange}
                        type={'box'}
                      />
                      <VStack className={'items-center'}>
                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Tool Photo
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Tap to change image
                        </Text>
                      </VStack>
                    </VStack>
                    {errors.photo_added && (
                      <FormControlError className={'justify-center'}>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.photo_added?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name={'name'}
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.name}>
                    <VStack space={'xs'}>
                      <FormControlLabel>
                        <FormControlLabelText
                          className={
                            'text-sm font-medium text-gray-700 dark:text-gray-300'
                          }
                        >
                          Tool name
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        className={clsx(
                          'h-12 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-80',
                          // Target the focus state specifically via the data attribute
                          'data-[focus=true]:border-blue-500 data-[focus=true]:ring-1 data-[focus=true]:ring-blue-500'
                        )}
                      >
                        <InputField
                          type={'text'}
                          placeholder={'e.g. Wrench, Hammer'}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          autoCapitalize={'none'}
                          className={
                            'text-gray-900 dark:text-white bg-white dark:bg-gray-900'
                          }
                        />
                      </Input>
                      {errors.name && (
                        <FormControlError>
                          <FormControlErrorIcon as={AlertCircleIcon} />
                          <FormControlErrorText>
                            {errors.name.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </VStack>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name={'box_id'}
                rules={{
                  required: 'Box where the tool is stored is required!',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.box_id}>
                    <VStack space={'xs'}>
                      <FormControlLabel>
                        <FormControlLabelText
                          className={
                            'text-sm font-medium text-gray-700 dark:text-gray-300'
                          }
                        >
                          Box!
                        </FormControlLabelText>
                      </FormControlLabel>
                      <BoxSearchSelect
                        value={value}
                        onSelect={onChange}
                        disabled={!!boxId}
                      />
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors?.box_id?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </VStack>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name={'description'}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.description}>
                    <VStack space={'xs'}>
                      <FormControlLabel>
                        <FormControlLabelText
                          className={
                            'text-sm font-medium text-gray-700 dark:text-gray-300'
                          }
                        >
                          Description (optional)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        className={clsx(
                          'h-12 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-80',
                          // Target the focus state specifically via the data attribute
                          'data-[focus=true]:border-blue-500 data-[focus=true]:ring-1 data-[focus=true]:ring-blue-500'
                        )}
                      >
                        <InputField
                          type={'text'}
                          placeholder={
                            "Briefly describe the tool you're storing..."
                          }
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value || ''}
                          autoCapitalize={'none'}
                          className={
                            'text-gray-900 dark:text-white bg-white dark:bg-gray-900'
                          }
                        />
                      </Input>
                    </VStack>
                  </FormControl>
                )}
              />
            </VStack>
          </View>
          <HStack space={'md'} className={'justify-end mt-2'}>
            <Button
              variant={'outline'}
              size={'lg'}
              className={
                'border-gray-200 dark:border-gray-700 rounded-xl px-6 py-3'
              }
              onPress={() =>
                router.canGoBack() ? router.back : router.navigate('/(tabs)')
              }
              disabled={isPending}
            >
              <ButtonText className={'text-gray-600 dark:text-gray-300'}>
                Cancel
              </ButtonText>
            </Button>
            <Button
              size={'lg'}
              className={`rounded-xl px-8 ${!isDirty ? 'bg-gray-300' : 'bg-blue-600 data-[hover=true]:bg-blue-700'}`}
              onPress={handleSubmit(saveTheTool)}
              disabled={!isDirty || isPending}
            >
              {isPending ? (
                <ActivityIndicator
                  size={'small'}
                  color={'white'}
                  className={'mr-2'}
                />
              ) : (
                <ButtonText className={'font-semibold text-white'}>
                  {isEditMode ? 'Update' : 'Create'}
                </ButtonText>
              )}
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
