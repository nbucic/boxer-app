import { supabase } from '@/lib/supabase';
import {
  getSignedUrlForImage,
  handleImageUploadToTheBucket,
} from '@/lib/helpers/supabase/storage';
import { Box, BoxFormData } from '@/types/box';
import { handleErrors } from '@/lib/helpers/supabase';
import { PostgrestError } from '@supabase/supabase-js';

const TABLE_NAME = 'boxes';
const BUCKET_NAME = 'boxes';
const squareImageOptions = { width: 300, height: 300 };

type filterProp = {
  location?: string;
  search?: string;
  limit?: number;
};

type optionsProp = {
  includeLocation?: boolean;
};

export const getBox = async (
  id: string,
  includeLocation: boolean = true
): Promise<Box> => {
  let selection = ['*'];
  if (includeLocation) {
    selection.push('location:locations (id, name)');
  }
  const {
    data,
    error,
  }: { data: any; error: null } | { data: any; error: PostgrestError } =
    await supabase
      .from(TABLE_NAME)
      .select(selection.join(', '))
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

export const getBoxEditData = async (id: string) => getBox(id, false);

export const getBoxes = async ({
  filter = {},
  options = { includeLocation: false },
}: {
  filter?: filterProp;
  options?: optionsProp;
}): Promise<Box[]> => {
  const { location, search, limit } = filter;
  const { includeLocation = false } = options;
  let selectColumns = ['*'];
  if (includeLocation) {
    selectColumns.push('location:locations (id, name)');
  }
  let query = supabase
    .from(TABLE_NAME)
    .select(selectColumns.join(', '))
    .order('updated_at', { ascending: false });

  if (location) {
    query = query.eq('location_id', location);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const {
    data,
    error,
  }: { data: any; error: null } | { data: null; error: PostgrestError } =
    await query;

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

export const createNewBox = async (formData: BoxFormData): Promise<void> => {
  const { new_asset, ...data } = formData;

  const { data: supabaseResponse, error: createError } = await supabase
    .from(TABLE_NAME)
    .insert(data)
    .select('id')
    .single();

  handleErrors(createError, 'Create box error:');

  const boxId = supabaseResponse?.id;

  if (boxId) {
    const image_url = await handleImageUploadToTheBucket({
      id: boxId,
      asset: new_asset!,
      bucket: BUCKET_NAME,
    });

    const { error: upsertError } = await supabase
      .from(TABLE_NAME)
      .update({ image_url: image_url })
      .eq('id', boxId);

    handleErrors(upsertError, 'Updating the box with the image error:');
  }
};

export const updateBox = async (
  id: string,
  formData: BoxFormData
): Promise<void> => {
  const { new_asset, ...data } = formData;

  if (new_asset) {
    data.image_url = await handleImageUploadToTheBucket({
      id,
      asset: new_asset,
      bucket: BUCKET_NAME,
    });
  }

  const { error } = await supabase.from(TABLE_NAME).update(data).eq('id', id);

  handleErrors(error, 'Update box error:');
};

export const deleteBox = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  handleErrors(error, 'Cannot delete box:');
};
