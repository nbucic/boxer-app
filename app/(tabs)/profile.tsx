import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertCircleIcon, Icon } from '@/components/ui/icon';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import Avatar from '@/components/Avatar';
import { Moon, RefreshCwIcon, Smartphone, Sun } from 'lucide-react-native';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, THEME_STORAGE_KEY } from '@/hooks/useInitialTheme';

// Extend the form's data type to include the new image asset.
type ProfileFormData = User & {
  new_avatar_asset: ImagePickerAsset | null;
};

export default function Profile() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { setColorScheme, colorScheme } = useColorScheme();

  const { data, status, error, isFetching, refetch, isRefetching } = useQuery<
    User,
    Error
  >({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });

  const {
    control,
    formState: { errors, isDirty, isValid },
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

  const { mutate } = useMutation({
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
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const setTheme = (theme: Theme) => {
    setColorScheme(theme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    // console.log(`Setting ${theme} theme!`);
    // window.location.reload();
  };

  return (
    <Box className={'flex-1 bg-white dark:bg-black'}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
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
        <View className={'px-6 py-4'}>
          <Heading size={'xl'} className={'text-gray-900 dark:text-white'}>
            Settings
          </Heading>
        </View>

        <VStack space={'lg'} className={'px-6 mt-2'}>
          <Heading
            size={'sm'}
            className={'text-gray-500 uppercase tracking-wider mb-2'}
          >
            Account Information
          </Heading>

          <HStack className={'items-center justify-center'}>
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

          <VStack space={'md'}>
            <Controller
              control={control}
              name={'email'}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors.email} size={'md'}>
                  <Text
                    className={
                      'mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300'
                    }
                  >
                    Email
                  </Text>
                  <Input
                    variant={'outline'}
                    size={'md'}
                    className={'bg-gray-50 dark:bg-gray-900 border-gray-300'}
                  >
                    <InputField
                      type={'text'}
                      placeholder={'email@example.com'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize={'none'}
                      readOnly={true}
                      className={'dark:text-white'}
                    />
                  </Input>
                  {errors.email && (
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>
                        {errors.email.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
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
                  <Text
                    className={
                      'mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300'
                    }
                  >
                    Full name
                  </Text>
                  <Input
                    variant={'outline'}
                    size={'md'}
                    className={'bg-gray-50 dark:bg-gray-900 border-gray-300'}
                  >
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
                        {errors.full_name.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
              )}
            />
          </VStack>

          <Button
            size={'md'}
            disabled={!isDirty}
            onPress={handleSubmit(onUpdateProfile)}
            className={`mt-2 ${!isDirty || !isValid ? 'bg-blue-300' : 'bg-blue-600'}`}
          >
            <ButtonText className={'font-medium'}>Save Changes</ButtonText>
          </Button>
        </VStack>

        <Divider className={'my-8 bg-gray-100 dark:bg-gray-800 h-2'} />

        {/* 2. PERSONALIZATION (Segmented Control Look) */}
        <VStack space={'md'} className={'px-6'}>
          <Heading
            size={'sm'}
            className={
              'text-gray-500 uppercase tracking-wider font-semibold mb-2'
            }
          >
            Personalization
          </Heading>

          <View>
            <Text
              className={
                'text-base font-medium text-gray-900 dark:text-white mb-3'
              }
            >
              App Theme
            </Text>

            <View
              className={'flex-row bg-gray-100 dark:bg-gray-800 p-1 rounded-lg'}
            >
              {(['light', 'dark', 'system'] as Theme[]).map((t) => {
                const isActive = colorScheme === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      setTheme(t);
                    }}
                    className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
                      isActive ? 'bg-white dark:bg-gray-600' : 'bg-transparent'
                    }`}
                  >
                    <Icon
                      as={
                        t === 'light' ? Sun : t === 'dark' ? Moon : Smartphone
                      }
                      size={'xs'}
                      className={`mr-2 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
                    />
                    <Text
                      className={`text-xs font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </VStack>

        <Divider className={'my-8 bg-gray-100 dark:bg-gray-800 h-2'} />

        {/* 3. SIGN OUT (Solid Red Button) */}
        <View className={'px-6 mb-6'}>
          <Button
            size={'lg'}
            action={'negative'}
            onPress={handleSignOut}
            className={'bg-red-500 w-full'}
          >
            <ButtonText className={'text-white font-bold'}>Sign Out</ButtonText>
          </Button>

          <Text className={'text-center text-gray-400 text-xs mt-6'}>
            Version 1.0.0.
          </Text>
        </View>
      </ScrollView>
    </Box>
  );
}
