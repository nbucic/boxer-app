import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import { getBoxStorageInformation } from '@/lib/helpers/supabase/storage';
import { Box, BoxFormData } from '@/types/box';

const TABLE_NAME = 'boxes';

type fetchBoxesFilterProp = {
  location?: string;
};

export const fetchAllBoxes = async ({
  filter,
}: {
  filter?: fetchBoxesFilterProp;
}): Promise<Box[]> => {
  let query = supabase
    .from(TABLE_NAME)
    .select(
      `
    *,
    location:locations (
      id,
      name
    )`
    )
    .order('updated_at', { ascending: false });

  if (filter?.location) {
    query = query.eq('location_id', filter.location);
  }

  const { data, error } = await query;

  if (error) {
    console.log('Fetch all boxes error:', error);
    throw error;
  }

  return await Promise.all(
    (data ?? []).map(async (box: Box) => {
      if (!box.image_url) {
        return { ...box, publicImageUrl: null };
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from(process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BOXES_BUCKET!)
          .createSignedUrl(box.image_url, 60 * 60 * 24 * 7);

      if (signedUrlError) {
        console.error(
          'Error creating signed URL for',
          box.image_url,
          signedUrlError
        );
        return { ...box, publicImageUrl: null };
      }

      return { ...box, publicImageUrl: signedUrlData.signedUrl };
    })
  );
};

export const getBox = async (id: string): Promise<Box> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      `
    *,
    location:locations (
      id,
      name
    )`
    )
    .eq('id', id)
    .single();

  if (error) {
    console.log('Get box error:', error);
    throw error;
  }

  if (data.image_url) {
    const { data: singedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BOXES_BUCKET!)
        .createSignedUrl(data.image_url, 60 * 60 * 24 * 7);

    if (signedUrlError) {
      console.error(
        'Error creating signed URL for',
        data.image_url,
        signedUrlError
      );
      return { ...data, publicImageUrl: null };
    }

    return { ...data, publicImageUrl: singedUrlData.signedUrl };
  }

  return { ...data, publicImageUrl: null };
};

export const createNewBox = async (data: BoxFormData): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User does not exist');
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .insert({ ...data, user_id: user.id });

  if (error) {
    console.log('Create box error:', error);
    throw error;
  }
};

export const updateBox = async (
  id: string,
  formData: BoxFormData
): Promise<void> => {
  const extractedData = await handleNewImageIfAny({ id, data: formData });

  const { error } = await supabase
    .from(TABLE_NAME)
    .update(extractedData)
    .eq('id', id);

  if (error) {
    console.log('Update box error:', error);
    throw error;
  }
};

export const deleteBox = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    throw error;
  }
};

const handleNewImageIfAny = async ({
  id,
  data,
}: {
  id: string;
  data: BoxFormData;
}) => {
  const { new_box_asset, ...extractedData } = data;

  if (new_box_asset) {
    const arrayBuffer = await fetch(new_box_asset.uri).then((res) =>
      res.arrayBuffer()
    );

    const extension =
      Platform.OS === 'web'
        ? (new_box_asset.mimeType?.split('/')[1] ?? 'jpeg')
        : (new_box_asset.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg');

    const { bucket, path } = await getBoxStorageInformation({
      id,
      extension,
    });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path as string, arrayBuffer, {
        contentType: new_box_asset.mimeType ?? `image/${extension}`,
        upsert: true,
      });

    if (uploadError) {
      console.log({ uploadError });
      throw uploadError;
    }

    extractedData.image_url = uploadData.path;
  }

  return extractedData;
};
