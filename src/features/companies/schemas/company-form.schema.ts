import { CompanyAddressType } from "@/constants/enums/companies/company-address-type.enum";
import { CompanyRelationshipStage } from "@/constants/enums/companies/company-relationship-stage.enum";
import { z } from "zod";

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

const addressSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "O nome do endereço é obrigatório.")
      .max(150),

    type: z
      .nativeEnum(CompanyAddressType)
      .default(CompanyAddressType.HEADQUARTERS),

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

    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),

    isPrimary: z.boolean().default(true),

    observations: z
      .string()
      .trim()
      .transform((value) => value || null),
  })
  .refine(
    (data) =>
      (data.latitude == null && data.longitude == null) ||
      (data.latitude != null && data.longitude != null),
    {
      message: "Informe latitude e longitude juntas.",
      path: ["latitude"],
    },
  );

export const companyFormSchema = z.object({
  corporateName: optionalText(255),

  tradeName: z
    .string()
    .trim()
    .min(1, "O nome fantasia é obrigatório.")
    .max(255, "O nome fantasia deve ter no máximo 255 caracteres."),

  cnpj: optionalDocument(14, "O CNPJ deve conter 14 números."),

  relationshipStage: z
    .nativeEnum(CompanyRelationshipStage)
    .default(CompanyRelationshipStage.CUSTOMER),

  observations: z
    .string()
    .trim()
    .transform((value) => value || null),

  address: addressSchema,
});

export type CompanyAddressFormInput = z.input<typeof addressSchema>;
export type CompanyAddressFormData = z.output<typeof addressSchema>;

export type CompanyFormInput = z.input<typeof companyFormSchema>;
export type CompanyFormData = z.output<typeof companyFormSchema>;
