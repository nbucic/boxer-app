import { supabase } from '@/lib/supabase';

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
