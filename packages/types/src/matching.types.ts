export type CustomerType = 'NEW_SIGNUP' | 'NEW_VISITOR' | 'WINBACK' | 'EXISTING';

export interface MatchRecord {
  id: string;
  dcmId: string;
  customerId: string;
  emailAddress?: string;
  signupDate: Date;
  totalVisits: number;
  visit1Date?: Date;
  matched: boolean;
  inPattern?: boolean;
  patternOverride?: string;
  customerType?: CustomerType;
  totalSales?: number;
  campaignId: string;
  market: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientDataRow {
  CustomerID: string;
  LastName?: string;
  FirstName?: string;
  EmailAddress?: string;
  SignupDate: number | Date;
  Visit1?: number | Date;
  TotalVisits?: number;
  TotalSales?: number;
  Market?: string;
}

export interface SanitizedData {
  dcmId: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  address?: string;
}
