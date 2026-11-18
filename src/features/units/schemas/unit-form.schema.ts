import { z } from "zod";

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => value || null);

const optionalCep = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .refine(
    (value) => value === "" || /^\d{8}$/.test(value),
    "O CEP deve conter 8 números.",
  )
  .transform((value) => value || null);

const unitAddressSchema = z
  .object({
    zipCode: optionalCep,
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
    areaType: z.string().default("URBAN"),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    observations: optionalText(5000),
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

export const unitFormSchema = z.object({
  companyId: z.string().uuid("Selecione uma empresa válida."),
  name: z
    .string()
    .trim()
    .min(1, "O nome da usina é obrigatório.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),
  type: z.string().min(1, "Selecione o tipo da unidade."),
  observations: optionalText(5000),
  address: unitAddressSchema,
});

export type UnitFormInput = z.input<typeof unitFormSchema>;
export type UnitFormData = z.output<typeof unitFormSchema>;