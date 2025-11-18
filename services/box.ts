import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import {
  getBoxStorageInformation,
  getSignedUrlForImage,
} from '@/lib/helpers/supabase/storage';
import { Box, BoxFormData } from '@/types/box';
import { handleErrors } from '@/lib/helpers/supabase';

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

  handleErrors(error, 'Fetch all boxes error:');

  return await Promise.all(
    (data ?? []).map(async (box: Box) => {
      if (!box.image_url) {
        return { ...box, publicImageUrl: null };
      }

      let publicImageUrl = await getSignedUrlForImage({ url: box.image_url });

      return { ...box, publicImageUrl };
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

  handleErrors(error, 'Get box error:');

  return {
    ...data,
    publicImageUrl: await getSignedUrlForImage({ url: data.image_url }),
  };
};

export const createNewBox = async (formData: BoxFormData): Promise<void> => {
  console.log(formData);
  const { new_box_asset, ...data } = formData;

  const { data: supabaseResponse, error: createError } = await supabase
    .from(TABLE_NAME)
    .insert(data)
    .select('id')
    .single();

  handleErrors(createError, 'Create box error:');

  const boxId = supabaseResponse?.id;

  if (boxId) {
    const extractedData = await handleNewImageIfAny({
      id: boxId,
      data: formData,
    });

    const { error: upsertError } = await supabase
      .from(TABLE_NAME)
      .update({ image_url: extractedData?.image_url })
      .eq('id', boxId);

    handleErrors(upsertError, 'Updating the box with the image error:');
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

  handleErrors(error, 'Update box error:');
};

export const deleteBox = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  handleErrors(error, 'Cannot delete box:');
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

    handleErrors(uploadError, 'Image upload to the bucket error:');

    extractedData.image_url = uploadData?.path;
  }

  return extractedData;
};
