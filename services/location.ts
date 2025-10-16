import { supabase } from '@/lib/supabase';

export interface LocationFormData {
  name: string;
  description?: string;
}

export interface Location extends LocationFormData {
  id: string;
  user_id: string;
}

const TABLE_NAME = 'locations';
export const createNewLocation = async (
  data: LocationFormData
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('USer does not exists');
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .insert({ ...data, user_id: user.id });

  if (error) {
    console.log('Location create error:', error);
    throw error;
  }
};

export const getLocationsForCurrentUser = async (): Promise<Location[]> => {
  const { data, error } = await supabase.from(TABLE_NAME).select();

  if (error) {
    console.log('Get locations error: ', error);
    throw error;
  }

  return data ?? [];
};

export const getLocation = async (id: string): Promise<Location> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select()
    .eq('id', id)
    .limit(1)
    .single();

  if (error || !data) {
    console.log('Get location by ID error:', id, error);
    throw error;
  }

  return data as any as Location;
};

export const updateLocation = async (
  id: string,
  formData: LocationFormData
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update(formData)
    .eq('id', id);

  if (error) {
    console.log('Update location by ID error:', id, error);
    throw error;
  }
};

export const deleteLocation = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    throw error;
  }
};
