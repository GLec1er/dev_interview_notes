import api from './api';
import type { Company, CompanyCreate, CompanyUpdate, CompanyListResponse } from '../types';

export const companyService = {
  async getCompanies(
    pageNumber: number = 1,
    limit: number = 10,
    sortBy: string = 'name',
    sortDir: string = 'asc',
    include_inactive: boolean = false,
  ): Promise<CompanyListResponse> {
    const params = new URLSearchParams();
    params.append('page_number', pageNumber.toString());
    params.append('limit', limit.toString());
    params.append('sort_by', sortBy);
    params.append('sort_dir', sortDir);
    params.append('include_inactive', include_inactive.toString());

    const response = await api.get(`/companies/?${params.toString()}`);
    return response.data;
  },

  async getCompaniesWithQuestions(
    pageNumber: number = 1,
    limit: number = 10,
    include_inactive: boolean = false,
    level: string,
  ): Promise<CompanyListResponse> {
    const params = new URLSearchParams();
    params.append('page_number', pageNumber.toString());
    params.append('limit', limit.toString());
    params.append('include_inactive', include_inactive.toString());
    if (level) {
      params.append('level', level);
    }

    const response = await api.get(`/companies/with-questions?${params.toString()}`);
    return response.data;
  },

  async getCompany(companyId: string): Promise<Company> {
    const response = await api.get(`/companies/${companyId}`);
    return response.data;
  },

  async createCompany(data: CompanyCreate): Promise<Company> {
    const response = await api.post('/companies/', data);
    return response.data;
  },

  async updateCompany(companyId: string, data: CompanyUpdate): Promise<Company> {
    const response = await api.patch(`/companies/${companyId}`, data);
    return response.data;
  },

  async deleteCompany(companyId: string): Promise<void> {
    await api.delete(`/companies/${companyId}`);
  },

  async getCompanyQuestions(
    companyId: string,
    pageNumber: number = 1,
    limit: number = 10,
  ) {
    const params = new URLSearchParams();
    params.append('page_number', pageNumber.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/companies/${companyId}/questions?${params.toString()}`);
    return response.data;
  },
};
