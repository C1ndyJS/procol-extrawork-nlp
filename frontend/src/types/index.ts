export type ExtraWork = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resources?: Resource[];
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  url?: string;
  metadata?: string;
  extraWorkId: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
