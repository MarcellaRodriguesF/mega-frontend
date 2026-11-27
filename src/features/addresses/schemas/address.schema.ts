
import { z } from "zod";

export const addressSchema = z.object({
  zipCode: z.string().min(1, "Informe o CEP."),
  street: z.string().min(1, "Informe o logradouro."),
  number: z.string().min(1, "Informe o número."),
  complement: z.string(),
  neighborhood: z.string().min(1, "Informe o bairro."),
  city: z.string().min(1, "Informe a cidade."),
  state: z.string().min(1, "Informe o estado."),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export type AddressFormInput = AddressFormData;

export const addressDefaultValues: AddressFormInput = {
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};
