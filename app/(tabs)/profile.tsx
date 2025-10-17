import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertCircleIcon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { Controller, useForm } from 'react-hook-form';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import {
  getCurrentUser,
  updateCurrentUser,
  UpdateUserPayload,
  User,
} from '@/services/user';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { router, useFocusEffect } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import Avatar from '@/components/Avatar';
import { RefreshCwIcon } from 'lucide-react-native';

// Extend the form's data type to include the new image asset.
type ProfileFormData = User & {
  new_avatar_asset: ImagePickerAsset | null;
};

export default function Profile() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, status, error, isFetching, refetch, isRefetching } = useQuery<
    User,
    Error
  >({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: {
      email: '',
      full_name: '',
      new_avatar_asset: null,
    },
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateUserPayload) => {
      return updateCurrentUser(data);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated successfully!');
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (e: Error) => {
      Alert.alert('Error', `Failed to update profile: ${e.message}`);
    },
  });

  const isBusy = isFetching || isUpdating;

  useEffect(() => {
    if (data) {
      reset({ ...data, new_avatar_asset: null });
      setAvatarPreview(data.avatar_url); // Set initial preview
    }
  }, [data, reset]);

  const handleImageChange = (image: ImagePickerAsset) => {
    setValue('new_avatar_asset', image, { shouldDirty: true });
    setAvatarPreview(image.uri);
  };

  const onUpdateProfile = (formData: ProfileFormData) => {
    if (!data?.id) return;

    mutate(formData);
  };

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isFetching && !data) {
    return (
      <View className={'flex-1 justify-center items-center'}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'error' && error) {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text>Error fetching profile: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      refreshControl={
        Platform.OS !== 'web' ? (
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {Platform.OS === 'web' && (
        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isRefetching}
          className="absolute top-5 right-5 z-10 bg-gray-200 p-2 rounded-full"
        >
          <RefreshCwIcon
            className={`w-5 h-5 text-gray-700 ${isRefetching ? 'animate-spin' : ''}`}
          />
        </TouchableOpacity>
      )}

      <View className={'p-4 w-full'}>
        <VStack className={'gap-4'}>
          <HStack className={'items-center justify-center gap-3'}>
            <Controller
              control={control}
              name="new_avatar_asset"
              render={() => (
                <Avatar
                  avatarUrl={avatarPreview}
                  onImageChange={handleImageChange}
                />
              )}
            />
          </HStack>

          <Controller
            control={control}
            name={'email'}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl size={'md'}>
                <VStack space={'xs'}>
                  <Text className={'text-typography-500'}>Email</Text>
                  <Input>
                    <InputField
                      type={'text'}
                      placeholder={'email@example.com'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize={'none'}
                      readOnly={true}
                    />
                  </Input>
                </VStack>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name={'full_name'}
            rules={{
              required: 'Full name is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.full_name} size={'md'}>
                <VStack space={'xs'}>
                  <Text className={'text-typography-500'}>Full name</Text>
                  <Input className={'text-center'}>
                    <InputField
                      type={'text'}
                      placeholder={'John Doe'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize={'words'}
                    />
                  </Input>
                  {errors.full_name && (
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>
                        {errors.full_name?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </VStack>
              </FormControl>
            )}
          />
          <HStack space={'md'} className={'justify-between'}>
            <Button
              variant={'outline'}
              onPress={() =>
                router.canGoBack() ? router.back() : router.navigate('/(tabs)')
              }
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              className={'accent-indicator-primary'}
              action={
                !isDirty || isBusy || !!errors.full_name
                  ? 'secondary'
                  : 'primary'
              }
              onPress={handleSubmit(onUpdateProfile)}
              disabled={!isDirty || isBusy || !!errors.full_name}
            >
              <ButtonText>Update</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </View>
    </ScrollView>
  );
}
