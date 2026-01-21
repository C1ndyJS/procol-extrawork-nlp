export type ViewType = 'recursos' | 'extraworks';

export interface ExtraWork {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  availability: string;
  extraWorkId?: string | null;
  createdAt: string;
  updatedAt: string;
  extraWorks?: ExtraWork[];
}
