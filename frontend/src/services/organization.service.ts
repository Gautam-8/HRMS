import api from '@/lib/axios';

export interface CreateOrganizationData {
  // Organization details
  name: string;
  description?: string;
  industry: string;
  legalName: string;
  panNumber?: string;
  gstNumber?: string;

  // HR User details
  fullName: string;
  email: string;
  password: string;
  phone: string;
  designation: string;
}

export interface CreateOrganizationResponse {
  message: string;
  organizationId: string;
}

class OrganizationService {
  async create(data: CreateOrganizationData): Promise<CreateOrganizationResponse> {
    const response = await api.post<CreateOrganizationResponse>('/organizations', data);
    return response.data;
  }
}

export const organizationService = new OrganizationService(); 