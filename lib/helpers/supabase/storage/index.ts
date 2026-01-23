import { supabase } from '@/lib/supabase';
import { handleErrors } from '@/lib/helpers/supabase';
import { Platform } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { StorageApiError, StorageError } from '@supabase/storage-js';

interface IAvatarStorageInformationRequest {
  userId?: string;
  extension?: string;
}

interface IAvatarStorageInformationResponse {
  bucket: string;
  path?: string;
}

const getBucketPrefixPath = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return `${user?.id}`;
};

export const getAvatarStorageInformation = ({
  userId,
  extension,
}: IAvatarStorageInformationRequest): IAvatarStorageInformationResponse => {
  let response: IAvatarStorageInformationResponse = {
    bucket: process.env.EXPO_PUBLIC_SUPABASE_STORAGE_AVATAR_BUCKET || '',
  };

  if (userId && extension) {
    response = {
      path: `${userId}/avatar.${extension}`,
      ...response,
    };
  }

  return response;
};

export const getSignedUrlForImage = async ({
  url,
  bucket = 'boxes',
  options = {},
}: {
  url: string | null | undefined;
  bucket?: 'boxes' | 'tools' | 'avatar';
  options?: {
    height?: number;
    quality?: number;
    resize?: 'cover' | 'contain' | 'fill';
    width?: number;
  };
}): Promise<string | null> => {
  if (url === null || url === undefined) {
    return null;
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(url, 60 * 60 * 24 * 7, {
      transform: options,
    });

  if (signedUrlError) {
    if (
      signedUrlError instanceof StorageApiError &&
      signedUrlError.statusCode === '404'
    ) {
      return null;
    }
  }

  handleErrors(signedUrlError, 'Error creating signed URL for', url);

  return signedUrlData?.signedUrl ?? null;
};

export const handleImageUploadToTheBucket = async ({
  id,
  asset,
  bucket,
}: {
  id: string;
  asset: ImagePickerAsset;
  bucket: string;
}) => {
  const arrayBuffer = await fetch(asset.uri).then((res) => res.arrayBuffer());

  const extension =
    Platform.OS === 'web'
      ? (asset.mimeType?.split('/')[1] ?? 'jpeg')
      : (asset.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg');

  const path = `${await getBucketPrefixPath()}/${id}.${extension}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path as string, arrayBuffer, {
      contentType: asset.mimeType ?? `image/${extension}`,
      upsert: true,
    });

  if (uploadError) {
    handleErrors(uploadError, 'Image upload to the bucket error:');
    throw uploadError;
  } else if (uploadData && uploadData.path) {
    return uploadData.path;
  } else {
    const error = new StorageError('No path assigned');
    handleErrors(error, 'Image upload to the bucket error:');
    throw error;
  }
};
