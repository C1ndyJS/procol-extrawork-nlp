export type ViewType = 'resources' | 'extraworks' | 'profile';

export interface Resource {
  id: string;
  name: string;
  type: string;
  url?: string;
  metadata?: any;
  extraWorkId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtraWork {
  id: string;
  title: string;
  description: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  resources?: Resource[];
  createdAt?: string;
  updatedAt?: string;
}