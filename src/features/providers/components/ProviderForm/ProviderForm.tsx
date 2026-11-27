"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input/Input";
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
import FormSection from "@/components/ui/FormSection/FormSection";

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
      phone: "",
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
      <FormSection isContentGrid>
        <Input
          label="Nome do provedor"
          placeholder="Ex.: Mega Telecom"
          required
          maxLength={255}
          disabled={isLoading}
          error={errors.name?.message}
          {...register("name")}
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

        <Textarea
          label="Observações"
          placeholder="Digite informações relevantes sobre o provedor..."
          rows={4}
          disabled={isLoading}
          error={errors.observations?.message}
          {...register("observations")}
        />
      </FormSection>
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
      phone: initialData?.phone ?? "",
    },
  });

  return (
    <form
      id={formId}
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <FormSection isContentGrid>
        <Input
          label="Nome do provedor"
          placeholder="Ex.: Mega Telecom"
          required
          maxLength={255}
          disabled={isLoading}
          error={errors.name?.message}
          {...register("name")}
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

        <Textarea
          label="Observações"
          placeholder="Digite informações relevantes sobre o provedor..."
          rows={4}
          disabled={isLoading}
          error={errors.observations?.message}
          {...register("observations")}
        />
      </FormSection>
    </form>
  );
}
