
import { z } from "zod";

export const unitConnectivityFormSchema = z.object({
  technology: z
    .string()
    .min(1, "Selecione a tecnologia."),

  providerId: z
    .string()
    .min(1, "Selecione o provedor."),

  connectionName: z
    .string()
    .trim()
    .min(1, "Informe o nome da conexão."),

  publicIp: z
    .string()
    .trim()
    .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Informe um endereço IP válido."),

  monitoringEnabled: z.boolean(),

  observations: z.string().trim(),
});

export type UnitConnectivityFormInput = z.input<
  typeof unitConnectivityFormSchema
>;

export type UnitConnectivityFormData = z.output<
  typeof unitConnectivityFormSchema
>;
