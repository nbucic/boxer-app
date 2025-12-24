import { ImagePickerAsset } from 'expo-image-picker';
import { Location } from '@/types/location';
import { SelectSearchable } from '@/types/index';

type BoxBase = {
  name: string;
  description?: string | null;
  location_id?: string | null;
  image_url?: string | null;
};
export type Box = SelectSearchable &
  BoxBase & {
    user_id: string | null; // uuid, nullable (RLS will set this for authenticated inserts)
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
    location: Location;
    publicImageUrl: string | null;
  };

export type BoxFormData = BoxBase & {
  new_box_asset?: ImagePickerAsset | null;
  photo_added: boolean;
};
