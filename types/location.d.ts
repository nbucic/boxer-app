import { SelectSearchable } from '@/types/index';

type LocationBase = {
  name: string;
  description?: string;
};

export type Location = SelectSearchable & LocationBase;

export type LocationFormData = LocationBase;
