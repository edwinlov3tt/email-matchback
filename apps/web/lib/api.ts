const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Campaign {
  id: string;
  name: string;
  billingNumber: string;
  dropDate: string;
  redropDate?: string;
  markets: string[];
  emailEndpoint: string;
  status: 'pending' | 'collecting' | 'matching' | 'analyzing' | 'complete' | 'error';
  campaignType: 'acquisition' | 'winback' | 'retention' | 'seasonal';
  priority: 'normal' | 'high' | 'urgent';
  expectedRecords?: number;
  vendorEmail: string;
  notes?: string;
  metrics?: {
    totalRecords?: number;
    matchedRecords?: number;
    matchRate?: number;
    inPattern?: number;
    outOfPattern?: number;
    newCustomers?: number;
    revenue?: number;
    roas?: number;
    cac?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignDto {
  name: string;
  billingNumber: string;
  dropDate: string;
  redropDate?: string;
  markets: string[];
  campaignType: 'acquisition' | 'winback' | 'retention' | 'seasonal';
  priority?: 'normal' | 'high' | 'urgent';
  expectedRecords?: number;
  vendorEmail: string;
  notes?: string;
}

export interface CampaignStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Campaign operations
  async getCampaigns(params?: {
    status?: string;
    market?: string;
    campaignType?: string;
  }): Promise<Campaign[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.market) searchParams.append('market', params.market);
    if (params?.campaignType) searchParams.append('campaignType', params.campaignType);

    const query = searchParams.toString();
    return this.request(`/campaigns${query ? `?${query}` : ''}`);
  }

  async getCampaign(id: string): Promise<Campaign> {
    return this.request(`/campaigns/${id}`);
  }

  async createCampaign(data: CreateCampaignDto): Promise<Campaign> {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(
    id: string,
    data: Partial<CreateCampaignDto> & { status?: Campaign['status'] }
  ): Promise<Campaign> {
    return this.request(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: string): Promise<void> {
    return this.request(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async getCampaignStats(): Promise<CampaignStats> {
    return this.request('/campaigns/stats');
  }
}

export const api = new ApiClient();
