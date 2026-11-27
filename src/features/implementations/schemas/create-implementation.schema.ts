import { z } from "zod";

const optionalSelection = z
  .string()
  .refine(
    (value) =>
      value === "" ||
      value === "none" ||
      z.string().uuid().safeParse(value).success,
    "Seleção inválida.",
  );

export const createImplementationSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da implantação.").max(255),
  description: z.string().trim().max(5000),
  templateId: optionalSelection,
  companyId: optionalSelection,
  unitId: optionalSelection,
});

export type CreateImplementationFormValues = z.infer<
  typeof createImplementationSchema
>;

export function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "none" ? null : trimmed;
}
