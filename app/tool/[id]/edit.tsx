import { Box } from '@/components/ui/box';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNewTool, getTool, updateTool } from '@/services/tool';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { Heading } from '@/components/ui/heading';
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
    queryFn: () => getTool(toolId!),
    enabled: isEditMode,
  });

  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<ToolFormData>({
    defaultValues: {
      name: '',
      description: '',
      new_tool_asset: null,
      photo_added: false,
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (data: ToolFormData) =>
      isEditMode ? updateTool(toolId!, data) : createNewTool(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tools'] });
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
    if (existingTool) {
      reset(existingTool);
    } else if (boxId) {
      setValue('box_id', boxId, { shouldDirty: false });
    }
    setValue('photo_added', !!existingTool);
  }, [existingTool, boxId, reset()]);

  useEffect(() => {
    if (existingTool?.publicImageUrl) {
      setPublicImageUrl(existingTool.publicImageUrl);
    }
  }, [existingTool?.publicImageUrl]);

  const handleImageChange = (image: ImagePickerAsset) => {
    setPublicImageUrl(image.uri);
    setValue('new_tool_asset', image, { shouldDirty: true });
    setValue('photo_added', true);
  };

  if (fetchingExistingTool) {
    return (
      <View className={'flex-1 justify-center'}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text>Error fetching box: {errorExistingTool.message}</Text>
      </View>
    );
  }

  return (
    <Box className={'flex-1 bg-white dark:bg-black'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className={'flex-1 '}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View className={'px-6 py-4'}>
            <Heading size={'xl'} className={'text-gray-900 dark:text-white'}>
              {isEditMode ? 'Edit tool' : 'Add new tool'}
            </Heading>
          </View>

          <VStack space={'md'} className={'px-6 mt-2'}>
            <Controller
              control={control}
              name={'photo_added'}
              rules={{ required: 'Photo is required!' }}
              render={() => (
                <FormControl isInvalid={!!errors.photo_added} size={'md'}>
                  <Avatar
                    avatarUrl={publicImageUrl}
                    onImageChange={handleImageChange}
                    type={'box'}
                  />
                  {errors.photo_added && (
                    <FormControlError>
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
                <FormControl isInvalid={!!errors.name} size={'md'}>
                  <Text className={'text-gray-700 dark:text-gray-300'}>
                    Name
                  </Text>
                  <Input
                    variant={'outline'}
                    size={'md'}
                    className={'bg-gray-50 dark:bg-ray-900 border-gray-300'}
                  >
                    <InputField
                      type={'text'}
                      placeholder={'Super tool'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize={'none'}
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
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name={'description'}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors.description} size={'md'}>
                  <Text className={'text-gray-700 dark:text-gray-300'}>
                    Description
                  </Text>
                  <Input
                    variant={'outline'}
                    size={'md'}
                    className={'bg-gray-50 dark:bg-ray-900 border-gray-300'}
                  >
                    <InputField
                      type={'text'}
                      placeholder={'Super tool'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value || ''}
                      autoCapitalize={'none'}
                    />
                  </Input>
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name={'box_id'}
              render={({ field: { onChange, value } }) => (
                <FormControl size={'md'}>
                  <FormControlLabel>
                    <FormControlLabelText>Box</FormControlLabelText>
                  </FormControlLabel>
                  <BoxSearchSelect
                    value={value}
                    onSelect={onChange}
                    disabled={!!boxId}
                  />
                </FormControl>
              )}
            />
          </VStack>

          <HStack space={'md'} className={'justify-between p-6 mb-6'}>
            <Button
              variant={'outline'}
              onPress={() =>
                router.canGoBack() ? router.back() : router.navigate('/(tabs)')
              }
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size={'lg'}
              onPress={handleSubmit((data: ToolFormData) => {
                mutate(data);
              })}
              disabled={!isDirty}
              className={`${!isDirty || !isValid ? 'bg-blue-300' : 'bg-blue-600'}`}
            >
              <ButtonText className={'font-medium'}>
                {isEditMode ? 'Update' : 'Create'}
              </ButtonText>
            </Button>
          </HStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
