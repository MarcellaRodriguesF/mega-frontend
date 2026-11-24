import { z } from "zod";

import {
  fieldTypeUsesOptions,
  FormFieldType,
} from "@/constants/enums/templates/form-field-type.enum";

const optionSchema = z.object({
  value: z.string().trim().min(1, "Informe o valor da opção."),
  label: z.string().trim().min(1, "Informe o rótulo da opção."),
});

export const formFieldFormSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1, "A chave é obrigatória.")
      .regex(
        /^[A-Za-z][A-Za-z0-9_]*$/,
        "Use uma letra no início e apenas letras, números e _.",
      ),
    label: z.string().trim().min(1, "O rótulo é obrigatório."),
    description: z.string().trim().transform((value) => value || null),
    type: z.enum(FormFieldType),
    placeholder: z.string().trim().transform((value) => value || null),
    isRequired: z.boolean(),
    options: z.array(optionSchema),
  })
  .superRefine((data, context) => {
    if (fieldTypeUsesOptions(data.type) && data.options.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Adicione pelo menos uma opção.",
        path: ["options"],
      });
    }

    const values = data.options.map((option) => option.value);

    if (new Set(values).size !== values.length) {
      context.addIssue({
        code: "custom",
        message: "Os valores das opções devem ser únicos.",
        path: ["options"],
      });
    }
  })
  .transform((data) => ({
    ...data,
    options: fieldTypeUsesOptions(data.type) ? data.options : null,
  }));

export type FormFieldFormInput = z.input<typeof formFieldFormSchema>;
export type FormFieldFormData = z.output<typeof formFieldFormSchema>;
