import { z } from "zod";
import { CompanyRelationshipStage } from "@/constants/enums/company-relationship-stage.enum";

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || null);

const optionalDocument = (length: number, message: string) =>
  z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine(
      (value) => value === "" || new RegExp(`^\\d{${length}}$`).test(value),
      message,
    )
    .transform((value) => value || null);

export const companyFormSchema = z.object({
  corporateName: optionalText(255),

  tradeName: z
    .string()
    .trim()
    .min(1, "O nome fantasia é obrigatório.")
    .max(255, "O nome fantasia deve ter no máximo 255 caracteres."),

  cnpj: optionalDocument(14, "O CNPJ deve conter 14 números."),

  zipCode: optionalDocument(8, "O CEP deve conter 8 números."),

  street: optionalText(255),
  number: optionalText(20),
  complement: optionalText(150),
  neighborhood: optionalText(100),
  city: optionalText(100),

  state: z
    .string()
    .trim()
    .toUpperCase()
    .transform((value) => value || null)
    .refine(
      (value) => value === null || value.length === 2,
      "Informe a sigla do estado.",
    ),

  relationshipStage: z
    .nativeEnum(CompanyRelationshipStage)
    .default(CompanyRelationshipStage.LEAD),

  observations: z
    .string()
    .trim()
    .transform((value) => value || null),
});

export type CompanyFormInput = z.input<typeof companyFormSchema>;
export type CompanyFormData = z.output<typeof companyFormSchema>;
