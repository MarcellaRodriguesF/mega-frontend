import type { ApiSuccess } from "../auth/auth.types";
import type { FormFieldType } from "@/constants/enums/templates/form-field-type.enum";
import type { FormTemplateStatus } from "@/constants/enums/templates/form-template-status.enum";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  formTemplateId: string;
  key: string;
  label: string;
  description: string | null;
  type: FormFieldType;
  placeholder: string | null;
  isRequired: boolean;
  order: number;
  options: FormFieldOption[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormTemplateSummary {
  id: string;
  name: string;
  description: string | null;
  status: FormTemplateStatus;
  createdAt: string;
  updatedAt: string;
  fieldCount: number;
  requirementCount: number;
}

export interface FormTemplateDetail {
  id: string;
  name: string;
  description: string | null;
  status: FormTemplateStatus;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
}

export interface FormTemplateRequest {
  name: string;
  description: string | null;
  status?: FormTemplateStatus;
}

export interface FormFieldRequest {
  key: string;
  label: string;
  description: string | null;
  type: FormFieldType;
  placeholder: string | null;
  isRequired: boolean;
  options: FormFieldOption[] | null;
}

export interface ReorderFieldsRequest {
  ids: string[];
}

export type FormTemplatesResponse = ApiSuccess<FormTemplateSummary[]>;
export type FormTemplateResponse = ApiSuccess<FormTemplateDetail>;
export type FormFieldResponse = ApiSuccess<FormField>;
