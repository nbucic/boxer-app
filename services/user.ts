import { supabase } from '@/lib/supabase';
import { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';
import {
  getAvatarStorageInformation,
  getSignedUrlForImage,
} from '@/lib/helpers/supabase/storage';
import { handleErrors } from '@/lib/helpers/supabase';

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url: string | null;
}

export interface UpdateUserPayload extends User {
  new_avatar_asset?: ImagePickerAsset | null;
}

export const getCurrentUser = async (): Promise<User> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error('No user on the session');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`full_name, avatar_url`)
    .eq('id', session.user.id)
    .single();

  handleErrors(error, '');

  return {
    id: session.user.id,
    email: session.user.email || '',
    ...data,
    avatar_url: await getSignedUrlForImage({
      url: data?.avatar_url,
      bucket: 'avatar',
      options: { width: 160, height: 160 },
    }),
  };
};

export const updateCurrentUser = async (
  data: UpdateUserPayload
): Promise<void> => {
  const { id, full_name } = data;
  if (!data.new_avatar_asset) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id, full_name, updated_at: new Date() });

    if (error) {
      console.log({ error });
      throw error;
    }
  } else {
    const image = data.new_avatar_asset;
    const arrayBuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

    const extension =
      Platform.OS === 'web'
        ? (image.mimeType?.split('/')[1] ?? 'jpeg')
        : (image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg');

    const { bucket, path } = getAvatarStorageInformation({
      userId: data.id,
      extension: extension,
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path as string, arrayBuffer, {
        contentType: image.mimeType ?? `image/${extension}`,
        upsert: true,
      });

    const { error } = await supabase.from('profiles').upsert({
      id,
      full_name,
      avatar_url: uploadData?.path,
      updated_at: new Date(),
    });

    if (uploadError || error) {
      console.log({ uploadError });
      throw uploadError;
    }
  }
};
