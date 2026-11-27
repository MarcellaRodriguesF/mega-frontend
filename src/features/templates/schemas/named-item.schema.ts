import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(1, "O nome é obrigatório.")
  .max(255, "O nome deve ter no máximo 255 caracteres.");

const descriptionSchema = z
  .string()
  .trim()
  .max(5000, "A descrição deve ter no máximo 5000 caracteres.")
  .transform((value) => value || null);

export const namedItemSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export type NamedItemInput = z.input<typeof namedItemSchema>;
export type NamedItemData = z.output<typeof namedItemSchema>;
