import { CompanyRelationshipStage } from "@/constants/enums/companies/company-relationship-stage.enum";
import { ApiSuccess } from "../auth/auth.types";
import { CompanyStatus } from "@/constants/enums/companies/company-status.enum";
import { CompanyAddressType } from "@/constants/enums/companies/company-address-type.enum";

export interface CompanyAddress {
  id: string;
  companyId: string;
  name: string;
  type: CompanyAddressType;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  isPrimary: boolean;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyAddressRequest {
  name: string;
  type?: CompanyAddressType;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isPrimary?: boolean;
  observations?: string | null;
}

export interface CreateCompanyRequest {
  corporateName?: string | null;
  tradeName: string;
  cnpj?: string | null;
  relationshipStage?: CompanyRelationshipStage;
  observations?: string | null;
  address?: CreateCompanyAddressRequest;
}

export interface UpdateCompanyRequest {
  corporateName?: string | null;
  tradeName?: string;
  cnpj?: string | null;
  relationshipStage?: CompanyRelationshipStage;
  status?: CompanyStatus;
  observations?: string | null;
  address?: CreateCompanyAddressRequest;
}

export interface Company {
  id: string;
  corporateName: string | null;
  tradeName: string;
  cnpj: string | null;
  relationshipStage: CompanyRelationshipStage;
  status: CompanyStatus;
  observations: string | null;
  addresses: CompanyAddress[];
  createdAt: string;
  updatedAt: string;
  contacts: ContactsCompany[];
}

export interface ContactsCompany {
  id: string;
  companyId: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateCompanyResponse = ApiSuccess<Company>;
export type CompanyResponse = ApiSuccess<Company>;
export type CompaniesResponse = ApiSuccess<Company[]>;
