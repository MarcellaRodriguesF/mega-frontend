"use client";

import { useEffect, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormSection from "@/components/ui/FormSection/FormSection";
import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";

import {
  createProviderDocumentFormSchema,
  providerDocumentDefaultValues,
  PROVIDER_DOCUMENT_ACCEPT,
  type ProviderDocumentFormData,
  type ProviderDocumentFormInput,
} from "@/features/providers/schemas/provider-document.schema";

import styles from "./ProviderDocumentForm.module.css";

interface ProviderDocumentFormProps {
  onSubmit: (data: ProviderDocumentFormData) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: ProviderDocumentFormInput;
  requireFile?: boolean;
  currentFileName?: string;
}

export default function ProviderDocumentForm({
  onSubmit,
  isLoading = false,
  initialData,
  requireFile = true,
  currentFileName,
}: ProviderDocumentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProviderDocumentFormInput, unknown, ProviderDocumentFormData>({
    resolver: zodResolver(createProviderDocumentFormSchema(requireFile)),
    defaultValues: initialData ?? providerDocumentDefaultValues,
  });

  useEffect(() => {
    register("file");
  }, [register]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setValue("file", file, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const fileError =
    typeof errors.file?.message === "string" ? errors.file.message : undefined;

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
          accept={PROVIDER_DOCUMENT_ACCEPT}
          required={requireFile}
          disabled={isLoading}
          onChange={handleFileChange}
          error={fileError}
          helperText={
            currentFileName
              ? `Arquivo atual: ${currentFileName}. Selecione outro apenas se quiser substituí-lo.`
              : "PDF, imagens, TXT ou documentos do Office. Tamanho máximo de 10 MB."
          }
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
