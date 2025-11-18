import { supabase } from '@/lib/supabase';
import { handleErrors } from '@/lib/helpers/supabase';

interface IAvatarStorageInformationRequest {
  userId?: string;
  extension?: string;
}

interface IAvatarStorageInformationResponse {
  bucket: string;
  path?: string;
}

export const getBoxStorageInformation = async ({
  id,
  extension,
}: {
  id: string;
  extension: string;
}): Promise<{ bucket: string; path: string }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    bucket: process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BOXES_BUCKET!,
    path: `${user?.id}/${id}.${extension}`,
  };
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
}: {
  url: string | null | undefined;
  bucket?: 'boxes' | 'avatar';
}): Promise<string | null> => {
  if (url === null || url === undefined) {
    return null;
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(url, 60 * 60 * 24 * 7, {
      transform: { width: 500, height: 500 },
    });

  handleErrors(signedUrlError, 'Error creating signed URL for', url);

  return signedUrlData?.signedUrl ?? null;
};
