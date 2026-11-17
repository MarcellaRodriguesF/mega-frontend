import { z } from "zod";

const optionalText = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .transform((value) => value || null);

export const providerDocumentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome do documento é obrigatório.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),

  type: z
    .string()
    .trim()
    .min(1, "O tipo do documento é obrigatório.")
    .max(50, "O tipo deve ter no máximo 50 caracteres."),

  fileName: z
    .string()
    .trim()
    .min(1, "O nome do arquivo é obrigatório.")
    .max(255, "O nome do arquivo deve ter no máximo 255 caracteres."),

  mimeType: optionalText(100, "O tipo do arquivo deve ter no máximo 100 caracteres."),

  sizeBytes: z.number().int().nonnegative().nullable(),

  expiresAt: z
    .string()
    .trim()
    .transform((value) => value || null),

  observations: z
    .string()
    .trim()
    .transform((value) => value || null),
});

export type ProviderDocumentFormInput = z.input<typeof providerDocumentSchema>;
export type ProviderDocumentFormData = z.output<typeof providerDocumentSchema>;

export const providerDocumentDefaultValues: ProviderDocumentFormInput = {
  name: "",
  type: "",
  fileName: "",
  mimeType: "",
  sizeBytes: null,
  expiresAt: "",
  observations: "",
};
