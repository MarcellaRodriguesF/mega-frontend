import type { ApiSuccess } from "../auth/auth.types";
import type { UnitStatus } from "@/constants/enums/units/unit-status.enum";

export interface UnitAddress {
  id: string;
  unitId: string;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  areaType: string;
  latitude: number | null;
  longitude: number | null;
  observations: string | null;
}

export interface UnitCompany {
  id: string;
  tradeName: string;
  corporateName: string | null;
}

export interface Unit {
  id: string;
  companyId: string;
  name: string;
  type: string;
  status: UnitStatus;
  observations: string | null;
  company: UnitCompany;
  address: UnitAddress | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  companyId: string;
  name: string;
  type: string;
  observations?: string | null;
  address?: {
    zipCode?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    areaType?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    observations?: string | null;
  };
}

export type UpdateUnitRequest = Partial<CreateUnitRequest> & {
  status?: UnitStatus;
};

export interface CompanyUnitProvider {
  id: string;
  name: string;
  phone: string | null;
}

export interface CompanyUnit {
  id: string;
  name: string;
  status: UnitStatus;
  publicIp: string | null;
  provider: CompanyUnitProvider | null;
}

export interface CompanyUnitsQuery {
  search?: string;
  status?: UnitStatus;
}

export type UnitResponse = ApiSuccess<Unit>;
export type UnitsResponse = ApiSuccess<Unit[]>;
export type CompanyUnitsResponse = ApiSuccess<CompanyUnit[]>;