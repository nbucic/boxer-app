import { supabase } from '@/lib/supabase';
import {
  getSignedUrlForImage,
  handleImageUploadToTheBucket,
} from '@/lib/helpers/supabase/storage';
import { handleErrors } from '@/lib/helpers/supabase';
import { User, UserFormData } from '@/types/user';

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
  formData: UserFormData
): Promise<void> => {
  const { new_asset, email, ...data } = formData;

  if (new_asset) {
    data.avatar_url = await handleImageUploadToTheBucket({
      imageName: 'avatar',
      asset: new_asset,
      bucket: 'avatar',
    });
  }

  const { error: upsertError } = await supabase.from('profiles').upsert(data);

  handleErrors(upsertError, 'Update user error:');
};
