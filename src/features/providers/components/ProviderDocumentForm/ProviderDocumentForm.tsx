"use client";

import { useEffect, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormSection from "@/components/ui/FormSection/FormSection";
import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";

import {
  providerDocumentDefaultValues,
  providerDocumentSchema,
  type ProviderDocumentFormData,
  type ProviderDocumentFormInput,
} from "@/features/providers/schemas/provider-document.schema";

import styles from "./ProviderDocumentForm.module.css";

interface ProviderDocumentFormProps {
  onSubmit: (data: ProviderDocumentFormData) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: ProviderDocumentFormInput;
}

export default function ProviderDocumentForm({
  onSubmit,
  isLoading = false,
  initialData,
}: ProviderDocumentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProviderDocumentFormInput, unknown, ProviderDocumentFormData>({
    resolver: zodResolver(providerDocumentSchema),
    defaultValues: initialData ?? providerDocumentDefaultValues,
  });

  useEffect(() => {
    register("mimeType");
    register("sizeBytes");
  }, [register]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setValue("fileName", file.name, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("mimeType", file.type || null, {
      shouldDirty: true,
    });

    setValue("sizeBytes", file.size, {
      shouldDirty: true,
    });
  }

  return (
    <form
      id="provider-document-form"
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <FormSection isContentGrid={false}>
        <Input
          label="Nome do documento"
          placeholder="Ex.: Contrato de prestação"
          required
          maxLength={150}
          disabled={isLoading}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Arquivo"
          type="file"
          disabled={isLoading}
          onChange={handleFileChange}
          helperText="Selecione o arquivo que deseja anexar."
        />

        <Textarea
          label="Observações"
          placeholder="Informações adicionais sobre este documento..."
          rows={4}
          disabled={isLoading}
          error={errors.observations?.message}
          {...register("observations")}
        />
      </FormSection>
    </form>
  );
}
