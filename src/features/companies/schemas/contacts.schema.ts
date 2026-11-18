import { z } from "zod";

const optionalText = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .transform((value) => value || null);

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome do contato é obrigatório.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),

  role: optionalText(100, "O cargo deve ter no máximo 100 caracteres."),

  email: z
    .string()
    .trim()
    .transform((value) => value || null)
    .pipe(
      z
        .string()
        .email("Informe um e-mail válido.")
        .max(255, "O e-mail deve ter no máximo 255 caracteres.")
        .nullable(),
    ),

  phone: optionalText(20, "O telefone deve ter no máximo 20 caracteres."),

  whatsapp: optionalText(20, "O WhatsApp deve ter no máximo 20 caracteres."),

  isPrimary: z.boolean(),
});

export type ContactFormInput = z.input<typeof contactSchema>;
export type ContactFormData = z.output<typeof contactSchema>;

export const contactDefaultValues: ContactFormInput = {
  name: "",
  role: "",
  email: "",
  phone: "",
  whatsapp: "",
  isPrimary: false,
};
