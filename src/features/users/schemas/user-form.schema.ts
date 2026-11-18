import { z } from "zod";

import { UserStatus } from "@/constants/enums/users/user-status-record.enum";

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do usuário.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),

  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido."),

  password: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.length >= 8,
      "A senha deve ter no mínimo 8 caracteres.",
    ),

  accessProfileId: z.string().min(1, "Selecione um perfil de acesso."),

  status: z.nativeEnum(UserStatus),
});

export type UserFormData = z.infer<typeof userFormSchema>;
