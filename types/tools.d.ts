import { ImagePickerAsset } from 'expo-image-picker';
import { SelectSearchable } from '@/types/index';

type ToolBase = {
  name: string;
  description?: string | null;
  box_id: string;
  image_url: string;
};

type BoxDetails = SelectSearchable;

export type Tool = SelectSearchable &
  ToolBase & {
    id: string;
    user_id: string | null;
    created_at: string;
    updated_at: string;
    box: BoxDetails;
  };

export type ToolWithBox = Tool & { box: BoxDetails };

export type ToolFormData = ToolBase & {
  new_asset?: ImagePickerAsset | null;
};
