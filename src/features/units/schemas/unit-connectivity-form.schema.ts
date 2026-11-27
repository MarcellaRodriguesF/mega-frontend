import { z } from "zod";

import {
  CONNECTIVITY_TECHNOLOGIES,
  type ConnectivityTechnology,
} from "@/services/api/unit-connectivities/unit-connectivities.types";

export type { ConnectivityTechnology };

export const CONNECTIVITY_TECHNOLOGY_OPTIONS: {
  value: ConnectivityTechnology;
  label: string;
}[] = [
  { value: "FIBRA", label: "Fibra óptica" },
  { value: "RADIO", label: "Rádio" },
];

export function isConnectivityTechnology(
  value: string,
): value is ConnectivityTechnology {
  return (CONNECTIVITY_TECHNOLOGIES as readonly string[]).includes(value);
}

export function getConnectivityTechnologyLabel(technology: string) {
  return (
    CONNECTIVITY_TECHNOLOGY_OPTIONS.find((option) => option.value === technology)
      ?.label ?? technology
  );
}

const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

export const unitConnectivityFormSchema = z.object({
  providerId: z.string().trim().min(1, "Selecione o provedor."),

  technology: z
    .string()
    .trim()
    .refine(isConnectivityTechnology, "Selecione a tecnologia."),

  publicIp: z
    .string()
    .trim()
    .max(45, "O IP público deve ter no máximo 45 caracteres.")
    .refine(
      (value) => value.length === 0 || ipv4Pattern.test(value),
      "Informe um endereço IP válido.",
    ),

  observations: z.string().trim(),
});

export type UnitConnectivityFormInput = z.input<
  typeof unitConnectivityFormSchema
>;

export type UnitConnectivityFormData = z.output<
  typeof unitConnectivityFormSchema
>;

export const UNIT_CONNECTIVITY_FORM_FIELDS = [
  "providerId",
  "technology",
  "publicIp",
  "observations",
] as const;

export type UnitConnectivityFormField =
  (typeof UNIT_CONNECTIVITY_FORM_FIELDS)[number];

export function isUnitConnectivityFormField(
  field: string,
): field is UnitConnectivityFormField {
  return (UNIT_CONNECTIVITY_FORM_FIELDS as readonly string[]).includes(field);
}
