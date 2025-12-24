import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
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
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import Avatar from '@/components/Avatar';
import { Computer, Moon, Smartphone, Sun } from 'lucide-react-native';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, THEME_STORAGE_KEY } from '@/hooks/useInitialTheme';
import { ListHeader } from '@/components/list/ListHeader';

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
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: {
      email: '',
      full_name: '',
    },
  });

  const { mutate, isPending } = useMutation({
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const setTheme = (theme: Theme) => {
    setColorScheme(theme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    // window.location.reload();
  };

  if (isFetching && !data) {
    return (
      <View
        className={'flex-1 justify-center items-center bg-background-0 gap-y-1'}
      >
        <ActivityIndicator size="large" className={'primary-500'} />
        <Text className={'text-typography-500'}>
          Crafting your profile data...
        </Text>
      </View>
    );
  }

  if (status === 'error' && error) {
    return (
      <View className={'flex-1 justify-center items-center bg-background-0'}>
        <Text>Error fetching profile: {error.message}</Text>
      </View>
    );
  }

  return (
    <Box className={'flex-1 bg-background-0'}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <ListHeader
          title={'Settings'}
          isRefetching={isRefetching}
          refetch={refetch}
        />

        <VStack space={'xl'} className={'px-6 mt-4'}>
          <Heading
            size={'xs'}
            className={'text-typography-500 uppercase tracking-widest'}
          >
            Account Information
          </Heading>

          <HStack className={'justify-center py-4'}>
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

          <VStack space={'lg'}>
            <FormControl isDisabled>
              <VStack space={'xs'}>
                <Text className={'text-typography-600 font-medium ml-1'}>
                  Email Address
                </Text>
                <Input
                  variant={'outline'}
                  size={'lg'}
                  className={'bg-background-50 opacity-60'}
                >
                  <InputField
                    type={'text'}
                    placeholder={'email@example.com'}
                    value={control._defaultValues.email}
                    autoCapitalize={'none'}
                    readOnly={true}
                  />
                </Input>
              </VStack>
            </FormControl>

            <Controller
              control={control}
              name={'full_name'}
              rules={{
                required: 'Full name is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors.full_name}>
                  <VStack space={'xs'}>
                    <Text className={'text-typography-600 font-medium ml-1'}>
                      Full name
                    </Text>
                    <Input
                      variant={'outline'}
                      size={'lg'}
                      className={'bg-background-50'}
                    >
                      <InputField
                        type={'text'}
                        placeholder={'Your name'}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize={'words'}
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>
                        {errors.full_name?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </VStack>
                </FormControl>
              )}
            />
          </VStack>

          <Button
            size={'lg'}
            className={'mt-4 bg-primary-500'}
            isDisabled={!isDirty || isPending}
            onPress={handleSubmit(onUpdateProfile)}
          >
            {isPending ? (
              <ButtonSpinner className={'mr-2'} />
            ) : (
              <ButtonText>Save Changes</ButtonText>
            )}
          </Button>
        </VStack>

        <Divider className={'my-4 bg-outline-100'} />

        {/* 2. PERSONALIZATION (Segmented Control Look) */}
        <VStack space={'xl'} className={'px-6 mt-4'}>
          <Heading
            size={'xs'}
            className={'text-typography-500 uppercase tracking-widest'}
          >
            Personalization
          </Heading>

          <View
            className={
              'bg-background-50 p-1.5 rounded-xl flex-row border border-outline-100'
            }
          >
            {(['light', 'dark', 'system'] as Theme[]).map((t) => {
              const isActive = colorScheme === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTheme(t)}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                    isActive ? 'bg-background-0 shadow-sm ' : 'bg-transparent'
                  }`}
                >
                  <Icon
                    as={
                      t === 'light'
                        ? Sun
                        : t === 'dark'
                          ? Moon
                          : Platform.OS === 'web'
                            ? Computer
                            : Smartphone
                    }
                    size={'xs'}
                    className={`${isActive ? 'text-primary-500' : 'text-typography-400'}`}
                  />
                  <Text
                    className={`ml-2 text-xs font-bold ${isActive ? 'text-typography-900' : 'text-typography-400'}`}
                  >
                    {t.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </VStack>

        <Divider className={'my-4 bg-outline-100'} />

        {/* 3. SIGN OUT (Solid Red Button) */}
        <Button
          action={'negative'}
          variant={'outline'}
          size={'lg'}
          onPress={handleSignOut}
          className={'border-error-500'}
        >
          <ButtonText className={'text-error-500'}>Sign Out</ButtonText>
        </Button>

        <Text className={'text-center text-typography-400 text-xs mt-1'}>
          Version 1.0.0.
        </Text>
      </ScrollView>
    </Box>
  );
}
