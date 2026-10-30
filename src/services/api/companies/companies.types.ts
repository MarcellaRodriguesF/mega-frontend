import { ApiSuccess } from "../auth/auth.types";
import { CompanyRelationshipStage } from "@/constants/enums/company-relationship-stage.enum";
import { RecordStatus } from "@/constants/enums/record-status.enum";

export interface CreateCompanyRequest {
  corporateName?: string | null;
  tradeName: string;
  cnpj?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  relationshipStage?: CompanyRelationshipStage;
  observations?: string | null;
}

export interface UpdateCompanyRequest {
  corporateName?: string | null;
  tradeName?: string;
  cnpj?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  relationshipStage?: CompanyRelationshipStage;
  status?: RecordStatus;
  observations?: string | null;
}

export interface Company {
  id: string;
  corporateName: string | null;
  tradeName: string;
  cnpj: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  relationshipStage: CompanyRelationshipStage;
  status: RecordStatus;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateCompanyResponse = ApiSuccess<Company>;
export type CompanyResponse = ApiSuccess<Company>;
export type CompaniesResponse = ApiSuccess<Company[]>;
