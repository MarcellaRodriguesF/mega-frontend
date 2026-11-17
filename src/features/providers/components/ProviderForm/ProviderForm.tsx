"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import CheckBoxInput from "@/components/ui/CheckBoxInput/CheckBoxInput";
import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import Textarea from "@/components/ui/Textarea/Textarea";

import { ProviderStatus } from "@/constants/enums/providers/provider-status.enum";

import {
  providerContactDraftDefaultValues,
  providerEditFormSchema,
  providerFormSchema,
  type ProviderEditFormData,
  type ProviderEditFormInput,
  type ProviderFormData,
  type ProviderFormInput,
} from "@/features/providers/schemas/provider-form.schema";

import styles from "./ProviderForm.module.css";

interface ProviderCreateFormProps {
  mode?: "create";
  formId?: string;
  isLoading?: boolean;
  onSubmit: (data: ProviderFormData) => void | Promise<void>;
}

interface ProviderEditFormProps {
  mode: "edit";
  formId?: string;
  isLoading?: boolean;
  initialData?: ProviderEditFormInput;
  onSubmit: (data: ProviderEditFormData) => void | Promise<void>;
}

type ProviderFormProps = ProviderCreateFormProps | ProviderEditFormProps;

export default function ProviderForm(props: ProviderFormProps) {
  if (props.mode === "edit") {
    return <ProviderEditForm {...props} />;
  }

  return <ProviderCreateForm {...props} />;
}

function ProviderCreateForm({
  formId = "provider-form",
  isLoading = false,
  onSubmit,
}: ProviderCreateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderFormInput, unknown, ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: "",
      observations: "",
      contact: providerContactDraftDefaultValues,
    },
  });

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Input
        label="Nome do provedor"
        placeholder="Ex.: Mega Telecom"
        required
        maxLength={255}
        disabled={isLoading}
        error={errors.name?.message}
        {...register("name")}
      />

      <Textarea
        label="Observações"
        placeholder="Digite informações relevantes sobre o provedor..."
        rows={4}
        disabled={isLoading}
        error={errors.observations?.message}
        {...register("observations")}
      />

      <div className={styles.contactSection}>
        <div>
          <h3 className={styles.sectionTitle}>Contato</h3>
          <p className={styles.sectionDescription}>
            Opcional. Cadastre um contato junto com o provedor.
          </p>
        </div>

        <Input
          label="Nome do contato"
          placeholder="Ex.: João Silva"
          maxLength={150}
          disabled={isLoading}
          error={errors.contact?.name?.message}
          {...register("contact.name")}
        />

        <Input
          label="Cargo"
          placeholder="Ex.: Gerente comercial"
          maxLength={100}
          disabled={isLoading}
          error={errors.contact?.role?.message}
          {...register("contact.role")}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="Ex.: joao@provedor.com"
          maxLength={255}
          disabled={isLoading}
          error={errors.contact?.email?.message}
          {...register("contact.email")}
        />

        <Input
          label="Telefone"
          placeholder="(34) 3333-4444"
          maxLength={20}
          inputMode="tel"
          type="phone"
          disabled={isLoading}
          error={errors.contact?.phone?.message}
          {...register("contact.phone")}
        />

        <Input
          label="WhatsApp"
          placeholder="(34) 99999-9999"
          maxLength={20}
          inputMode="tel"
          type="phone"
          disabled={isLoading}
          error={errors.contact?.whatsapp?.message}
          {...register("contact.whatsapp")}
        />

        <CheckBoxInput
          label="Definir como contato principal"
          helperText="Este contato será identificado como o principal do provedor."
          disabled={isLoading}
          {...register("contact.isPrimary")}
        />
      </div>
    </form>
  );
}

function ProviderEditForm({
  formId = "provider-edit-form",
  isLoading = false,
  initialData,
  onSubmit,
}: ProviderEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderEditFormInput, unknown, ProviderEditFormData>({
    resolver: zodResolver(providerEditFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      observations: initialData?.observations ?? "",
      status: initialData?.status ?? ProviderStatus.ACTIVE,
    },
  });

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Input
        label="Nome do provedor"
        placeholder="Ex.: Mega Telecom"
        required
        maxLength={255}
        disabled={isLoading}
        error={errors.name?.message}
        {...register("name")}
      />

      <Select
        label="Status"
        disabled={isLoading}
        error={errors.status?.message}
        options={[
          { value: ProviderStatus.ACTIVE, label: "Ativo" },
          { value: ProviderStatus.INACTIVE, label: "Inativo" },
        ]}
        {...register("status")}
      />

      <Textarea
        label="Observações"
        placeholder="Digite informações relevantes sobre o provedor..."
        rows={4}
        disabled={isLoading}
        error={errors.observations?.message}
        {...register("observations")}
      />
    </form>
  );
}
