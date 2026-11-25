import { z } from "zod";

export const createImplementationSchema = z.object({
  templateId: z.string().uuid("Selecione um template publicado."),
  unitId: z.string().uuid("Selecione uma unidade."),
});

export type CreateImplementationFormValues = z.infer<
  typeof createImplementationSchema
>;
