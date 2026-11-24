"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import FormSection from "@/components/ui/FormSection/FormSection";

import { providersApi } from "@/services/api/providers/providers.api";

import {
  unitConnectivityFormSchema,
  type UnitConnectivityFormInput,
  type UnitConnectivityFormData,
} from "@/features/units/schemas/unit-connectivity-form.schema";

import type { UnitConnectivity } from "@/services/api/unit-connectivities/unit-connectivities.types";

interface UnitConnectivityFormProps {
  unitId: string;
  formId?: string;
  initialData?: UnitConnectivity;
  isLoading?: boolean;
  onSubmit: (data: UnitConnectivityFormData) => void | Promise<void>;
}

export default function UnitConnectivityForm({
  unitId,
  formId = "unit-connectivity-form",
  initialData,
  isLoading = false,
  onSubmit,
}: UnitConnectivityFormProps) {
  const { data: providers = [], isPending: isLoadingProviders } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const response = await providersApi.findAll();
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UnitConnectivityFormInput, unknown, UnitConnectivityFormData>({
    resolver: zodResolver(unitConnectivityFormSchema),
    defaultValues: {
      technology: initialData?.technology ?? "",
      providerId: initialData?.providerId ?? "",
      publicIp: initialData?.publicIp ?? "",
      monitoringEnabled: initialData?.monitoringEnabled ?? false,
      observations: initialData?.observations ?? "",
    },
  });

  const monitoringEnabled = watch("monitoringEnabled");

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormSection isContentGrid>
        <Input
          label="Nome da conexão"
          required
          placeholder="Ex.: Conexão principal"
          maxLength={45}
          disabled={isLoading}
          error={errors.connectionName?.message}
          {...register("connectionName")}
        />{" "}
        <Select
          label="Provedor"
          required
          disabled={isLoading || isLoadingProviders}
          options={providers.map((provider) => ({
            value: provider.id,
            label: provider.name,
          }))}
          {...register("providerId")}
        />
        <Input
          label="IP público"
          required
          placeholder="Ex.: 200.150.10.25"
          maxLength={45}
          disabled={isLoading}
          error={errors.publicIp?.message}
          {...register("publicIp")}
        />
        <Select
          label="Tecnologia"
          required
          disabled={isLoading}
          error={errors.technology?.message}
          options={[
            { value: "FIBRA", label: "Fibra óptica" },
            { value: "RADIO", label: "Rádio" },
          ]}
          {...register("technology")}
        />
        <div>
          <label>
            <input
              type="checkbox"
              disabled={isLoading}
              {...register("monitoringEnabled")}
            />{" "}
            Habilitar monitoramento
          </label>

          <p>
            {monitoringEnabled
              ? "O monitoramento desta conexão ficará habilitado."
              : "O monitoramento desta conexão ficará desabilitado."}
          </p>
        </div>
      </FormSection>
    </form>
  );
}
