import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import {
  getBoxStorageInformation,
  getSignedUrlForImage,
  handleImageUploadToTheBucket,
} from '@/lib/helpers/supabase/storage';
import { Box, BoxFormData } from '@/types/box';
import { handleErrors } from '@/lib/helpers/supabase';
import { createCommonSearchQuery } from '@/services/index';

const TABLE_NAME = 'boxes';
const BUCKET_NAME = 'boxes';
const squareImageOptions = { width: 300, height: 300 };

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
        return { ...box, image_url: null };
      }

      let image_url = await getSignedUrlForImage({
        url: box.image_url,
        bucket: BUCKET_NAME,
        options: squareImageOptions,
      });

      return { ...box, image_url };
    })
  );
};

export const getBox = async (
  id: string,
  includeLocation: boolean = true
): Promise<Box> => {
  let selection = '*';
  if (includeLocation) {
    selection = `
    *,
    location:locations (
      id,
      name
    )`;
  }
  const { data, error }: { data: any; error: any | undefined } = await supabase
    .from(TABLE_NAME)
    .select(selection)
    .eq('id', id)
    .single();

  handleErrors(error, 'Get box error:');

  return {
    ...data,
    image_url: await getSignedUrlForImage({
      url: data.image_url,
      bucket: BUCKET_NAME,
      options: squareImageOptions,
    }),
  };
};

export const getBoxEditData = async (id: string): Promise<Box> => {
  return getBox(id, false);
};

export const getBoxes = async ({
  search,
  limit,
}: { search?: string; limit?: number } = {}): Promise<Box[]> => {
  return createCommonSearchQuery(TABLE_NAME, search, limit);
};

export const getBoxWithoutLocation = async (id: string): Promise<Box> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select()
    .eq('id', id)
    .limit(1)
    .single();

  handleErrors(error, 'Get box without location:');

  return data;
};

export const createNewBox = async (formData: BoxFormData): Promise<void> => {
  const { new_box_asset, photo_added, ...data } = formData;

  const { data: supabaseResponse, error: createError } = await supabase
    .from(TABLE_NAME)
    .insert(data)
    .select('id')
    .single();

  handleErrors(createError, 'Create box error:');

  const boxId = supabaseResponse?.id;

  if (boxId) {
    const uploadedImagePath = await handleImageUploadToTheBucket({
      id: boxId,
      asset: new_box_asset!,
      bucket: BUCKET_NAME,
    });

    const { error: upsertError } = await supabase
      .from(TABLE_NAME)
      .update({ image_url: uploadedImagePath })
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
  } else {
    delete extractedData.image_url;
  }

  return extractedData;
};
