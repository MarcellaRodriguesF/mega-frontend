"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormSection from "@/components/ui/FormSection/FormSection";
import Input from "@/components/ui/Input/Input";

import {
  providerContactDefaultValues,
  providerContactSchema,
  type ProviderContactFormData,
  type ProviderContactFormInput,
} from "@/features/providers/schemas/provider-contact.schema";

import styles from "./ProviderContactForm.module.css";

interface ProviderContactFormProps {
  onSubmit: (data: ProviderContactFormData) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: ProviderContactFormInput;
}

export default function ProviderContactForm({
  onSubmit,
  isLoading = false,
  initialData,
}: ProviderContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderContactFormInput, unknown, ProviderContactFormData>({
    resolver: zodResolver(providerContactSchema),
    defaultValues: initialData ?? providerContactDefaultValues,
  });

  return (
    <form
      id="provider-contact-form"
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <FormSection>
        <Input
          label="Nome completo"
          placeholder="Ex.: João Silva"
          required
          maxLength={150}
          disabled={isLoading}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Cargo"
          placeholder="Ex.: Gerente comercial"
          maxLength={100}
          disabled={isLoading}
          error={errors.role?.message}
          {...register("role")}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="Ex.: joao@provedor.com"
          maxLength={255}
          disabled={isLoading}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Telefone"
          placeholder="(34) 3333-4444"
          maxLength={20}
          inputMode="tel"
          type="phone"
          disabled={isLoading}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </FormSection>
    </form>
  );
}
