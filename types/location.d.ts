type LocationBase = {
  name: string;
  description?: string;
};

export type Location = LocationBase & {
  id: string; //uuid
};

export type LocationFormData = LocationBase;
