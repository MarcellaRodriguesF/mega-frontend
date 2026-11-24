"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import Textarea from "@/components/ui/Textarea/Textarea";
import FormSection from "@/components/ui/FormSection/FormSection";
import FormMessage from "@/components/ui/FormMessage/FormMessage";

import { ApiError } from "@/services/api/api-client";
import { providersApi } from "@/services/api/providers/providers.api";

import {
  CONNECTIVITY_TECHNOLOGY_OPTIONS,
  isConnectivityTechnology,
  isUnitConnectivityFormField,
  unitConnectivityFormSchema,
  type UnitConnectivityFormData,
  type UnitConnectivityFormInput,
} from "@/features/units/schemas/unit-connectivity-form.schema";
import { getUnitConnectivityErrorMessage } from "@/features/units/unit-connectivity";

import type { UnitConnectivity } from "@/services/api/unit-connectivities/unit-connectivities.types";

import styles from "./UnitConnectivityForm.module.css";

interface UnitConnectivityFormProps {
  formId?: string;
  initialData?: UnitConnectivity;
  isLoading?: boolean;
  submitError?: unknown;
  onSubmit: (data: UnitConnectivityFormData) => void | Promise<void>;
}

function initialTechnology(technology?: string) {
  return technology && isConnectivityTechnology(technology) ? technology : "";
}

export default function UnitConnectivityForm({
  formId = "unit-connectivity-form",
  initialData,
  isLoading = false,
  submitError = null,
  onSubmit,
}: UnitConnectivityFormProps) {
  const {
    data: providers = [],
    isPending: isLoadingProviders,
    isError: isProvidersError,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const response = await providersApi.findAll();
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UnitConnectivityFormInput, unknown, UnitConnectivityFormData>({
    resolver: zodResolver(unitConnectivityFormSchema),
    defaultValues: {
      providerId: initialData?.providerId ?? "",
      technology: initialTechnology(initialData?.technology),
      publicIp: initialData?.publicIp ?? "",
      observations: initialData?.observations ?? "",
    },
  });

  useEffect(() => {
    if (!(submitError instanceof ApiError) || !submitError.details) return;
    if (submitError.code !== "VALIDATION_ERROR") return;

    for (const detail of submitError.details) {
      if (!detail.field || !isUnitConnectivityFormField(detail.field)) continue;

      setError(detail.field, { message: detail.message });
    }
  }, [setError, submitError]);

  const providerOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.name,
  }));

  if (
    initialData?.provider &&
    !providerOptions.some((option) => option.value === initialData.provider?.id)
  ) {
    providerOptions.unshift({
      value: initialData.provider.id,
      label: initialData.provider.name,
    });
  }

  const submitMessage = submitError
    ? getUnitConnectivityErrorMessage(submitError)
    : "";

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormSection isContentGrid>
        {submitMessage && (
          <div className={styles.span}>
            <FormMessage message={submitMessage} />
          </div>
        )}

        <Select
          label="Provedor"
          required
          disabled={isLoading || isLoadingProviders}
          error={
            errors.providerId?.message ??
            (isProvidersError
              ? "Não foi possível carregar os provedores."
              : undefined)
          }
          options={providerOptions}
          {...register("providerId")}
        />

        <Select
          label="Tecnologia"
          required
          disabled={isLoading}
          error={errors.technology?.message}
          options={CONNECTIVITY_TECHNOLOGY_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          {...register("technology")}
        />

        <Input
          label="IP público"
          placeholder="Ex.: 200.150.10.25"
          maxLength={45}
          disabled={isLoading}
          error={errors.publicIp?.message}
          {...register("publicIp")}
        />

        <div className={styles.span}>
          <Textarea
            label="Observações"
            placeholder="Informações adicionais sobre a conexão"
            rows={4}
            disabled={isLoading}
            error={errors.observations?.message}
            {...register("observations")}
          />
        </div>
      </FormSection>
    </form>
  );
}
