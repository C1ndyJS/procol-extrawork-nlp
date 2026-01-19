import { ExtraWork, Resource, Action, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    }
  }

  // ExtraWork endpoints
  async getExtraWorks(): Promise<ApiResponse<ExtraWork[]>> {
    return this.request<ExtraWork[]>('/extraworks');
  }

  async getExtraWork(id: string): Promise<ApiResponse<ExtraWork>> {
    return this.request<ExtraWork>(`/extraworks/${id}`);
  }

  async createExtraWork(data: Partial<ExtraWork>): Promise<ApiResponse<ExtraWork>> {
    return this.request<ExtraWork>('/extraworks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExtraWork(id: string, data: Partial<ExtraWork>): Promise<ApiResponse<ExtraWork>> {
    return this.request<ExtraWork>(`/extraworks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExtraWork(id: string): Promise<ApiResponse<ExtraWork>> {
    return this.request<ExtraWork>(`/extraworks/${id}`, {
      method: 'DELETE',
    });
  }

  // Resource endpoints
  async getResources(): Promise<ApiResponse<Resource[]>> {
    return this.request<Resource[]>('/resources');
  }

  // Action endpoints
  async searchActions(query: string, threshold?: number): Promise<ApiResponse<Action[]>> {
    return this.request<Action[]>('/actions/search', {
      method: 'POST',
      body: JSON.stringify({ query, threshold }),
    });
  }

  async executeAction(query: string, params?: any): Promise<ApiResponse<any>> {
    return this.request<any>('/actions/execute', {
      method: 'POST',
      body: JSON.stringify({ query, params }),
    });
  }

  async executeActionByIntent(intent: string, params: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/actions/execute/${intent}`, {
      method: 'POST',
      body: JSON.stringify({ params }),
    });
  }
}

export const apiService = new ApiService();
