import { PostgrestError } from '@supabase/supabase-js';
import { StorageError } from '@supabase/storage-js';

export const handleErrors = (
  error: PostgrestError | StorageError | Error |null,
  message: string,
  context?: any
) => {
  if (error) {
    console.error(message, context ? { context, error } : error);
    throw error;
  }
};
