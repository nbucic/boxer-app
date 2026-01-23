import { supabase } from '@/lib/supabase';
import { Location, LocationFormData } from '@/types/location';
import { handleErrors } from '@/lib/helpers/supabase';

const TABLE_NAME = 'locations';

type SearchProps = {
  filter?: {
    search?: string;
    limit?: number;
  };
};

export const getLocation = async (id: string): Promise<Location> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select()
    .eq('id', id)
    .limit(1)
    .single();

  handleErrors(error, 'Get location error:');

  return data;
};

export const getLocations = async ({
  filter = {},
}: SearchProps): Promise<Location[]> => {
  const { search, limit } = filter;
  let query = supabase.from(TABLE_NAME).select();

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (limit) {
    query = query.limit(limit);
  }

  query = query.order('updated_at', { ascending: false });

  const { data, error } = await query;

  handleErrors(error, 'Get locations error:');

  return data || [];
};

export const createNewLocation = async (
  data: LocationFormData
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User does not exists');
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .insert({ ...data, user_id: user.id });

  handleErrors(error, 'Location create error:');
};

export const updateLocation = async (
  id: string,
  formData: LocationFormData
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update(formData)
    .eq('id', id);

  handleErrors(error, 'Update location by ID error:', id);
};

export const deleteLocation = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  handleErrors(error, 'Delete location by ID error:', id);
};

export const isLocationEmpty = async (locationId: string): Promise<boolean> => {
  const { count, error } = await supabase
    .from('boxes')
    .select('*', { count: 'exact', head: true })
    .eq('location_id', locationId);

  handleErrors(error, 'Error counting boxes by location:', locationId);

  return count ? count === 0 : true;
};
