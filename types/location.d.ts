type LocationBase = {
  name: string;
  description?: string;
};

export type Location = LocationBase & {
  id: string; //uuid
  noBoxes: number;
};

export type LocationFormData = LocationBase;
