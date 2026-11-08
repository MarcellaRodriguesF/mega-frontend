"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import styles from "./ContactForm.module.css";
import Input from "@/components/ui/Input/Input";
import FormSection from "@/components/ui/FormSection/FormSection";
import { contactDefaultValues, ContactFormData, ContactFormInput, contactSchema } from "@/features/companies/schemas/contacts.schema";

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
      <FormSection
        title="Dados do contato"
        description="Informe os dados pessoais e profissionais do contato."
      >
        <div className={styles.fields}>
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
        </div>
      </FormSection>

      <FormSection
        title="Canais de contato"
        description="Informe os meios de comunicação com este contato."
      >
        <div className={styles.fields}>
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
            disabled={isLoading}
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            label="WhatsApp"
            placeholder="(34) 99999-9999"
            maxLength={20}
            inputMode="tel"
            disabled={isLoading}
            error={errors.whatsapp?.message}
            {...register("whatsapp")}
          />
        </div>
      </FormSection>

      <label className={styles.primaryContact}>
        <input
          type="checkbox"
          {...register("isPrimary")}
          disabled={isLoading}
        />

        <span>
          <strong>Definir como contato principal</strong>
          <small>
            Este contato será identificado como o principal da empresa.
          </small>
        </span>
      </label>
    </form>
  );
}
