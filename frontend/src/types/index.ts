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
  url?: string;
  metadata?: string;
  extraWorkId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  intent: string;
  score: number;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
