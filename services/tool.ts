import { Tool, ToolFormData, ToolWithBox } from '@/types/tools';
import { supabase } from '@/lib/supabase';
import { handleErrors } from '@/lib/helpers/supabase';
import {
  getSignedUrlForImage,
  handleImageUploadToTheBucket,
} from '@/lib/helpers/supabase/storage';

const TABLE_NAME = 'tools';
const BUCKET_NAME = 'tools';
const squareImageOptions = { width: 300, height: 300 };

type fetchToolsFilterProp = {
  box?: string;
};

export const fetchAllTools = async ({
  filter,
}: {
  filter?: fetchToolsFilterProp;
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

export const createNewTool = async (formData: ToolFormData): Promise<void> => {
  const { new_tool_asset, photo_added, ...data } = formData;

  debugger;

  const { data: supabaseResponse, error: createError } = await supabase
    .from(TABLE_NAME)
    .insert(data)
    .select('id')
    .single();

  handleErrors(createError, 'Create tool error:');

  const toolId = supabaseResponse?.id;

  if (toolId) {
    const uploadedImagePath = await handleImageUploadToTheBucket({
      id: toolId,
      asset: new_tool_asset!,
      bucket: BUCKET_NAME,
    });

    const { error: upsertError } = await supabase
      .from(TABLE_NAME)
      .update({ image_url: uploadedImagePath })
      .eq('id', toolId);

    handleErrors(upsertError, 'Updating the tool with the image error:');
  }
};

export const updateTool = async (
  id: string,
  formData: ToolFormData
): Promise<void> => {
  const { new_tool_asset, photo_added, ...data } = formData;
  if (new_tool_asset) {
    data.image_url = await handleImageUploadToTheBucket({
      id,
      asset: new_tool_asset,
      bucket: process.env.EXPO_PUBLIC_SUPABASE_STORAGE_TOOLS_BUCKET!,
    });
  }

  const { error } = await supabase.from(TABLE_NAME).update(data).eq('id', id);

  handleErrors(error, 'Update tool error:');
};

export const deleteTool = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  handleErrors(error, 'Cannot delete tool:');
};
