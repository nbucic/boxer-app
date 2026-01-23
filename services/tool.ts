import { supabase } from '@/lib/supabase';
import {
  getSignedUrlForImage,
  handleImageUploadToTheBucket,
} from '@/lib/helpers/supabase/storage';
import { Tool, ToolFormData, ToolWithBox } from '@/types/tools';
import { handleErrors } from '@/lib/helpers/supabase';

const TABLE_NAME = 'tools';
const BUCKET_NAME = 'tools';
const squareImageOptions = { width: 300, height: 300 };

type filterProp = {
  box?: string;
};

export const getTool = async (
  id: string,
  includeBox: boolean = true
): Promise<ToolWithBox> => {
  let selection = '*';
  if (includeBox) {
    selection = `
    *,
    box:boxes (
      id, 
      name
    )`;
  }
  const { data, error }: { data: any; error: any | undefined } = await supabase
    .from(TABLE_NAME)
    .select(selection)
    .eq('id', id)
    .single();

  handleErrors(error, 'Get tool error:');

  return {
    ...data,
    image_url: await getSignedUrlForImage({
      url: data.image_url,
      bucket: BUCKET_NAME,
      options: squareImageOptions,
    }),
  };
};

export const getToolEditData = async (id: string) => await getTool(id, false);

export const getTools = async ({
  filter,
}: {
  filter?: filterProp;
}): Promise<Tool[]> => {
  let query = supabase
    .from(TABLE_NAME)
    .select(
      `
    *,
    box:boxes (
      id,
      name
    )`
    )
    .order('updated_at', { ascending: false });

  if (filter?.box) {
    query = query.eq('box_id', filter.box);
  }

  const { data, error } = await query;

  handleErrors(error, 'Fetch all tools error:');

  return await Promise.all(
    (data ?? []).map(async (tool: Tool) => {
      return {
        ...tool,
        image_url:
          (await getSignedUrlForImage({
            url: tool.image_url,
            bucket: BUCKET_NAME,
            options: squareImageOptions,
          })) ?? '',
      };
    })
  );
};

export const createNewTool = async (formData: ToolFormData): Promise<void> => {
  const { new_asset, ...data } = formData;

  const { data: supabaseResponse, error: createError } = await supabase
    .from(TABLE_NAME)
    .insert(data)
    .select('id')
    .single();

  handleErrors(createError, 'Create tool error:');

  const toolId = supabaseResponse?.id;

  if (toolId) {
    const image_url = await handleImageUploadToTheBucket({
      id: toolId,
      asset: new_asset!,
      bucket: BUCKET_NAME,
    });

    const { error: upsertError } = await supabase
      .from(TABLE_NAME)
      .update({ image_url: image_url })
      .eq('id', toolId);

    handleErrors(upsertError, 'Updating the tool with the image error:');
  }
};

export const updateTool = async (
  id: string,
  formData: ToolFormData
): Promise<void> => {
  debugger;
  const { new_asset, ...data } = formData;

  if (new_asset) {
    data.image_url = await handleImageUploadToTheBucket({
      id: id,
      asset: new_asset,
      bucket: BUCKET_NAME,
    });
  }

  debugger;
  const { error } = await supabase.from(TABLE_NAME).update(data).eq('id', id);

  debugger;
  handleErrors(error, 'Update tool error:');
};

export const deleteTool = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  handleErrors(error, 'Cannot delete tool:');
};
