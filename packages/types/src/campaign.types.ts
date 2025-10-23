export type CampaignStatus = 'pending' | 'collecting' | 'matching' | 'analyzing' | 'complete' | 'error';

export type CampaignType = 'acquisition' | 'winback' | 'retention' | 'seasonal';

export type Priority = 'normal' | 'high' | 'urgent';

export interface Campaign {
  id: string;
  name: string;
  billingNumber: string;
  dropDate: Date;
  redropDate?: Date;
  markets: string[];
  emailEndpoint: string;
  status: CampaignStatus;
  campaignType: CampaignType;
  priority: Priority;
  expectedRecords?: number;
  vendorEmail: string;
  notes?: string;
  metrics?: CampaignMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignMetrics {
  totalRecords?: number;
  matchedRecords?: number;
  matchRate?: number;
  inPattern?: number;
  outOfPattern?: number;
  newCustomers?: number;
  revenue?: number;
  roas?: number;
  cac?: number;
}

export interface CreateCampaignDto {
  name: string;
  billingNumber: string;
  dropDate: string | Date;
  redropDate?: string | Date;
  markets: string[];
  campaignType: CampaignType;
  priority?: Priority;
  expectedRecords?: number;
  vendorEmail: string;
  notes?: string;
}
