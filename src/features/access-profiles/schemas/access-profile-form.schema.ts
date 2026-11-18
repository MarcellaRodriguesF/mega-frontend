import { z } from "zod";

export const accessProfileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),

  description: z
    .string()
    .max(255, "A descrição deve ter no máximo 255 caracteres."),
});

export type AccessProfileFormData = z.infer<typeof accessProfileFormSchema>;
