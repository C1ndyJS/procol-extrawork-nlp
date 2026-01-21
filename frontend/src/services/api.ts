/**
 * API service for communicating with the backend intentions system
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ActionSuggestion {
  intent: string;
  score: number;
  description: string;
  title?: string;
  subtitle?: string;
  params?: any;
}

export interface ActionResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  navigate?: boolean;
  extraWorkId?: string;
}

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
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Search for actions based on natural language query
   */
  async searchActions(query: string, threshold: number = 0.3): Promise<ActionSuggestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/actions/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, threshold }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error searching actions:', error);
      return [];
    }
  }

  /**
   * Execute an action based on natural language query
   */
  async executeAction(query: string, params: any = {}): Promise<ActionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/actions/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, params }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error executing action:', error);
      return {
        success: false,
        error: error.message || 'Error executing action',
      };
    }
  }

  /**
   * Execute an action by intent name
   */
  async executeActionByIntent(intent: string, params: any = {}): Promise<ActionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/actions/execute/${intent}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error executing action by intent:', error);
      return {
        success: false,
        error: error.message || 'Error executing action',
      };
    }
  }

  // === ExtraWorks ===

  async getExtraWorks(): Promise<ExtraWork[]> {
    try {
      const response = await fetch(`${this.baseUrl}/extraworks`);
      if (!response.ok) throw new Error('Failed to fetch ExtraWorks');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching ExtraWorks:', error);
      return [];
    }
  }

  async searchExtraWorks(query: string): Promise<ExtraWork[]> {
    try {
      const response = await fetch(`${this.baseUrl}/extraworks/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search ExtraWorks');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error searching ExtraWorks:', error);
      return [];
    }
  }

  // === Resources ===

  async getResources(): Promise<Resource[]> {
    try {
      const response = await fetch(`${this.baseUrl}/resources`);
      if (!response.ok) throw new Error('Failed to fetch Resources');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching Resources:', error);
      return [];
    }
  }

  async searchResources(query: string): Promise<Resource[]> {
    try {
      const response = await fetch(`${this.baseUrl}/resources/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search Resources');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error searching Resources:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();
