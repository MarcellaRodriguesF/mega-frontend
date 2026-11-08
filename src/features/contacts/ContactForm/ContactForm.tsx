"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import styles from "./ContactForm.module.css";
import Input from "@/components/ui/Input/Input";
import FormSection from "@/components/ui/FormSection/FormSection";
import {
  contactDefaultValues,
  ContactFormData,
  ContactFormInput,
  contactSchema,
} from "@/features/companies/schemas/contacts.schema";
import CheckBoxInput from "@/components/ui/CheckBoxInput/CheckBoxInput";

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: ContactFormInput;
}

export default function ContactForm({
  onSubmit,
  isLoading = false,
  initialData,
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInput, unknown, ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData ?? contactDefaultValues,
  });

  return (
    <form
      id="contact-form"
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
          placeholder="Ex.: joao@empresa.com"
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

        <Input
          label="WhatsApp"
          placeholder="(34) 99999-9999"
          maxLength={20}
          inputMode="tel"
          type="phone"
          disabled={isLoading}
          error={errors.whatsapp?.message}
          {...register("whatsapp")}
        />
      </FormSection>

      <CheckBoxInput
        label="Definir como contato principal"
        helperText="Este contato será identificado como o principal da empresa."
        disabled={isLoading}
        {...register("isPrimary")}
      />
    </form>
  );
}
