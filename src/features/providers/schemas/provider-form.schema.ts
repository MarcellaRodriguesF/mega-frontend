import { z } from "zod";

import { ProviderStatus } from "@/constants/enums/providers/provider-status.enum";

const providerNameSchema = z
  .string()
  .trim()
  .min(1, "O nome do provedor é obrigatório.")
  .max(255, "O nome deve ter no máximo 255 caracteres.");

const providerObservationsSchema = z
  .string()
  .trim()
  .transform((value) => value || null);

const providerContactDraftSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(150, "O nome deve ter no máximo 150 caracteres."),
    role: z
      .string()
      .trim()
      .max(100, "O cargo deve ter no máximo 100 caracteres."),
    email: z
      .string()
      .trim()
      .max(255, "O e-mail deve ter no máximo 255 caracteres."),
    phone: z
      .string()
      .trim()
      .max(20, "O telefone deve ter no máximo 20 caracteres."),
    isPrimary: z.boolean(),
  })
  .superRefine((contact, context) => {
    const hasValue = [
      contact.name,
      contact.role,
      contact.email,
      contact.phone,
    ].some((value) => value.length > 0);

    if (!hasValue) return;

    if (!contact.name) {
      context.addIssue({
        code: "custom",
        message: "O nome do contato é obrigatório.",
        path: ["name"],
      });
    }

    if (
      contact.email &&
      !z.string().email().safeParse(contact.email).success
    ) {
      context.addIssue({
        code: "custom",
        message: "Informe um e-mail válido.",
        path: ["email"],
      });
    }
  });

export type ProviderContactDraft = z.infer<typeof providerContactDraftSchema>;

function toNullableContact(contact: ProviderContactDraft) {
  const hasValue = [
    contact.name,
    contact.role,
    contact.email,
    contact.phone,
  ].some((value) => value.length > 0);

  if (!hasValue) return null;

  return {
    name: contact.name,
    role: contact.role || null,
    email: contact.email || null,
    phone: contact.phone || null,
    isPrimary: contact.isPrimary,
  };
}

export const providerFormSchema = z
  .object({
    name: providerNameSchema,
    phone: z.string().trim().max(20, "O telefone deve ter no máximo 20 caracteres."),
    observations: providerObservationsSchema,
    contact: providerContactDraftSchema,
  })
  .transform((data) => ({
    name: data.name,
    phone: data.phone,
    observations: data.observations,
    contact: toNullableContact(data.contact),
  }));

export const providerEditFormSchema = z.object({
  name: providerNameSchema,
  phone: z.string().trim().max(20, "O telefone deve ter no máximo 20 caracteres."),
  observations: providerObservationsSchema,
  status: z.nativeEnum(ProviderStatus),
});

export type ProviderFormInput = z.input<typeof providerFormSchema>;
export type ProviderFormData = z.output<typeof providerFormSchema>;

export type ProviderEditFormInput = z.input<typeof providerEditFormSchema>;
export type ProviderEditFormData = z.output<typeof providerEditFormSchema>;

export const providerContactDraftDefaultValues: ProviderContactDraft = {
  name: "",
  role: "",
  email: "",
  phone: "",
  isPrimary: true,
};
