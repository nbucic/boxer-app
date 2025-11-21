import { supabase } from '@/lib/supabase';
import { Location, LocationFormData } from '@/types/location';
import { PostgrestError } from '@supabase/supabase-js';
import { createCommonSearchQuery } from '@/services/index';

const TABLE_NAME = 'locations';
const handleErrorsAndReturnData = (
  data: any | null,
  error: PostgrestError | null,
  message: string,
  context?: any
) => {
  if (error) {
    console.error(message, context ? { context, error } : error);
    throw error;
  }

  return data;
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

  handleErrorsAndReturnData(null, error, 'Location create error:');
};

export const getLocations = async ({
  search,
  limit,
}: { search?: string; limit?: number } = {}): Promise<Location[]> => {
  return createCommonSearchQuery(TABLE_NAME, search, limit);
};

export const getLocation = async (id: string): Promise<Location> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select()
    .eq('id', id)
    .limit(1)
    .single();

  return handleErrorsAndReturnData(
    data,
    error,
    'Get location by ID error:',
    id
  );
};

export const updateLocation = async (
  id: string,
  formData: LocationFormData
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update(formData)
    .eq('id', id);

  handleErrorsAndReturnData(null, error, 'Update location by ID error:', id);
};

export const isLocationEmpty = async (locationId: string): Promise<boolean> => {
  const { count, error } = await supabase
    .from('boxes')
    .select('*', { count: 'exact', head: true })
    .eq('location_id', locationId);

  return handleErrorsAndReturnData(
    count ? count === 0 : true,
    error,
    'Error counting boxes by location:',
    locationId
  );
};

export const deleteLocation = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  handleErrorsAndReturnData(null, error, 'Delete location by ID error:', id);
};
