"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormSection from "@/components/ui/FormSection/FormSection";
import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";
import Select, { type SelectOption } from "@/components/ui/Select/Select";

import {
  createProviderDocumentFormSchema,
  providerDocumentDefaultValues,
  PROVIDER_DOCUMENT_ACCEPT,
  NO_DOCUMENT_UNIT,
  type ProviderDocumentFormData,
  type ProviderDocumentFormInput,
} from "@/features/providers/schemas/provider-document.schema";

import styles from "./ProviderDocumentForm.module.css";
import FileUpload from "@/components/ui/FileUpload/FileUpload.tsx";

interface ProviderDocumentFormProps {
  onSubmit: (data: ProviderDocumentFormData) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: ProviderDocumentFormInput;
  requireFile?: boolean;
  currentFileName?: string;
  unitOptions?: SelectOption[];
}

export default function ProviderDocumentForm({
  onSubmit,
  isLoading = false,
  initialData,
  requireFile = true,
  currentFileName,
  unitOptions,
}: ProviderDocumentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProviderDocumentFormInput, unknown, ProviderDocumentFormData>({
    resolver: zodResolver(createProviderDocumentFormSchema(requireFile)),
    defaultValues: initialData ?? providerDocumentDefaultValues,
  });

  useEffect(() => {
    register("file");
  }, [register]);

  const selectedFile = watch("file");

  const fileError =
    typeof errors.file?.message === "string" ? errors.file.message : undefined;
  const typeError =
    typeof errors.type?.message === "string" ? errors.type.message : undefined;
  const unitError =
    typeof errors.unitId?.message === "string"
      ? errors.unitId.message
      : undefined;

  function handleFileChange(file: File | null) {
    setValue("file", file, {
      shouldDirty: true,
      shouldValidate: true,
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
          label="Tipo do documento"
          placeholder="Ex.: Contrato"
          maxLength={50}
          disabled={isLoading}
          error={typeError}
          {...register("type")}
        />

        {unitOptions ? (
          <Select
            label="Unidade"
            placeholder="Selecione uma unidade"
            options={[
              { value: NO_DOCUMENT_UNIT, label: "Sem unidade associada" },
              ...unitOptions,
            ]}
            disabled={isLoading || unitOptions.length === 0}
            error={unitError}
            {...register("unitId")}
          />
        ) : null}

        <FileUpload
          label="Arquivo"
          file={selectedFile ?? null}
          onChange={handleFileChange}
          currentFileName={currentFileName}
          accept={PROVIDER_DOCUMENT_ACCEPT}
          required={requireFile}
          disabled={isLoading}
          error={fileError}
          helperText="PDF, imagens, TXT ou documentos do Office."
          maxSizeMB={10}
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
