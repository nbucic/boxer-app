import { Box } from '@/types/box';
import { ImagePickerAsset } from 'expo-image-picker';

type ToolBase = {
  name: string;
  description?: string | null;
  box_id: string;
  image_url: string;
};

export type Tool = ToolBase & {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  box: Box;
  publicImageUrl: string | null;
};

export type ToolFormData = ToolBase & {
  new_tool_asset?: ImagePickerAsset | null;
  photo_added: boolean;
};
