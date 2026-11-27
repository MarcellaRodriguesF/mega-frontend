
import { z } from "zod";

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `O texto deve ter no máximo ${maxLength} caracteres.`)
    .transform((value) => value || null);

const optionalCep = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .refine(
    (value) => value === "" || /^\d{8}$/.test(value),
    "O CEP deve conter 8 números.",
  )
  .transform((value) => value || null);


  const coordinateSchema = (min: number, max: number) =>
    z.preprocess(
      (value) => {
        if (
          value === "" ||
          value === undefined ||
          value === null
        ) {
          return null;
        }
  
        return Number(value);
      },
      z
        .number()
        .min(min, `O valor mínimo é ${min}.`)
        .max(max, `O valor máximo é ${max}.`)
        .nullable(),
    );
  

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
    areaType: z.enum(["URBAN", "RURAL"]).nullable(),
    latitude: coordinateSchema(-90, 90),
    longitude: coordinateSchema(-180, 180),
  })
  .refine(
    (data) =>
      (data.latitude === null && data.longitude === null) ||
      (data.latitude !== null && data.longitude !== null),
    {
      message: "Informe latitude e longitude juntas.",
      path: ["longitude"],
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
