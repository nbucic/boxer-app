import { supabase } from '@/lib/supabase';
import { handleErrors } from '@/lib/helpers/supabase';

export const createCommonSearchQuery = async (
  tableName: string,
  search?: string,
  limit?: number
) => {
  let query = supabase.from(tableName).select();

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (limit) {
    query = query.limit(limit);
  }

  query = query.order('updated_at', { ascending: false });

  const { data, error } = await query;

  handleErrors(error, 'Get locations error:');

  return data ?? [];
};
