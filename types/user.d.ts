import { ImagePickerAsset } from 'expo-image-picker';

export type User = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string | null;
};

export type UserFormData = User & {
  new_asset?: ImagePickerAsset;
};
