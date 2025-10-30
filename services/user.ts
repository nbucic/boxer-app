import { supabase } from '@/lib/supabase';
import { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';
import { getAvatarStorageInformation } from '@/lib/helpers/supabase/storage';

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

  const { data, error, status } = await supabase
    .from('profiles')
    .select(`full_name, avatar_url`)
    .eq('id', session.user.id)
    .single();

  if (error && status !== 406) {
    throw error;
  }

  // If an avatar_url (path) exists, download it and convert it to a base64 data URL
  if (data && data.avatar_url) {
    try {
      const { bucket } = getAvatarStorageInformation({});
      const { data: storageData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(data.avatar_url);

      if (downloadError) {
        throw downloadError;
      }

      // Overwrite the path-based avatar_url with the full data URL for rendering
      data.avatar_url = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
          resolve(fr.result as string);
        };
        fr.onerror = (_err) => {
          reject(new Error('Failed to read avatar file.'));
        };
        fr.readAsDataURL(storageData);
      });
    } catch (e) {
      data.avatar_url = null;
    }
  }

  return {
    id: session.user.id,
    email: session.user.email || '',
    ...data,
    avatar_url: data?.avatar_url || null,
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
