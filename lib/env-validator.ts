const envMap = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_SUPABASE_STORAGE_AVATAR_BUCKET:
    process.env.EXPO_PUBLIC_SUPABASE_STORAGE_AVATAR_BUCKET,
  EXPO_PUBLIC_SUPABASE_STORAGE_BOXES_BUCKET:
    process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BOXES_BUCKET,
  EXPO_PUBLIC_SUPABASE_STORAGE_TOOLS_BUCKET:
    process.env.EXPO_PUBLIC_SUPABASE_STORAGE_TOOLS_BUCKET,
};

const isProduction = process.env.NODE_ENV === 'production';

export const validateEnvironment = () => {
  const missingKeys = Object.entries(envMap)
    .filter(([_, value]) => !value || value.trim() === '')
    .map(([key]) => key);

  return {
    isValid: missingKeys.length === 0,
    missingKeys: isProduction ? [] : missingKeys,
  };
};
