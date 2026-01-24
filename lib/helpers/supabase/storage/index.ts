import { supabase } from '@/lib/supabase';
import { handleErrors } from '@/lib/helpers/supabase';
import { ImagePickerAsset } from 'expo-image-picker';
import { StorageApiError, StorageError } from '@supabase/storage-js';
import { Bucket } from '@/services/base';

const getBucketPrefixPath = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return `${user?.id}`;
};

export const getSignedUrlForImage = async ({
  url,
  bucket = 'boxes',
  options = {},
}: {
  url: string | null | undefined;
  bucket?: Bucket;
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
  imageName,
  asset,
  bucket,
}: {
  imageName: string;
  asset: ImagePickerAsset;
  bucket: string;
}) => {
  const response = await fetch(asset.uri).then((res) => res.blob());
  const path = `${await getBucketPrefixPath()}/${imageName}.webp`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, response, {
      contentType: `image/webp`,
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
