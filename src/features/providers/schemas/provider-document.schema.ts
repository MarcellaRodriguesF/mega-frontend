
import { z } from "zod";

export const providerDocumentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome do documento é obrigatório.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),

  fileName: z
    .string()
    .trim()
    .min(1, "Selecione um arquivo.")
    .max(255, "O nome do arquivo deve ter no máximo 255 caracteres."),

  mimeType: z.string().nullable().optional(),

  sizeBytes: z.number().nullable().optional(),

  observations: z
    .string()
    .trim()
    .transform((value) => value || null),
});

export type ProviderDocumentFormInput = z.input<
  typeof providerDocumentSchema
>;

export type ProviderDocumentFormData = z.output<
  typeof providerDocumentSchema
>;

export const providerDocumentDefaultValues: ProviderDocumentFormInput = {
  name: "",
  fileName: "",
  mimeType: "",
  sizeBytes: null,
  observations: "",
};
