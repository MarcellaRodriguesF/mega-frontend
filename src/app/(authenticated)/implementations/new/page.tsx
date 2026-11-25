"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";

import Button from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import Select from "@/components/ui/Select/Select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import UnitContextCard from "@/features/implementations/components/UnitContextCard/UnitContextCard";
import {
  createImplementationSchema,
  type CreateImplementationFormValues,
} from "@/features/implementations/schemas/create-implementation.schema";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { implementationsApi } from "@/services/api/implementations/implementations.api";

import styles from "./page.module.css";

export default function NewImplementationPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [companyId, setCompanyId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const canAccess = hasPermission(PERMISSIONS.IMPLEMENTATIONS);

  const templatesQuery = useQuery({
    queryKey: ["implementation-templates"],
    queryFn: () => implementationsApi.listPublishedTemplates(),
    enabled: canAccess,
  });

  const unitsQuery = useQuery({
    queryKey: ["implementation-units", companyId],
    queryFn: () => implementationsApi.listUnits(companyId || undefined),
    enabled: canAccess,
  });

  const companiesQuery = useQuery({
    queryKey: ["implementation-units"],
    queryFn: () => implementationsApi.listUnits(),
    enabled: canAccess,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateImplementationFormValues>({
    resolver: zodResolver(createImplementationSchema),
    defaultValues: {
      templateId: "",
      unitId: "",
    },
  });

  const selectedUnitId = useWatch({ control, name: "unitId" });
  const units = unitsQuery.data?.data ?? [];
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId) ?? null;
  const companies = useMemo(() => {
    const byId = new Map<string, string>();

    for (const unit of companiesQuery.data?.data ?? []) {
      byId.set(unit.company.id, unit.company.tradeName);
    }

    return [...byId.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
  }, [companiesQuery.data?.data]);

  if (!canAccess) {
    return (
      <PageContainer>
        <PageState
          type="forbidden"
          title="Sem permissão para implantações"
          description="Esta área é restrita a usuários com acesso ao módulo de implantações."
        />
      </PageContainer>
    );
  }

  async function onSubmit(data: CreateImplementationFormValues) {
    try {
      setIsSaving(true);
      const response = await implementationsApi.create(data);
      toast.success("A implantação foi criada com a estrutura do template.");
      router.push(`/implementations/${response.data.id}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível criar a implantação.";
      toast.error(message);
      setIsSaving(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Nova implantação"
        description="Escolha um template publicado e a unidade. A estrutura usada fica copiada nesta implantação."
        action={
          <Button
            variant="outline"
            text="Voltar"
            onClick={() => router.push("/implementations")}
          />
        }
      />

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Select
          label="Template publicado"
          required
          disabled={isSaving || templatesQuery.isLoading}
          options={(templatesQuery.data?.data ?? []).map((template) => ({
            value: template.id,
            label: template.name,
          }))}
          error={errors.templateId?.message}
          {...register("templateId")}
        />
        <Select
          label="Cliente"
          value={companyId || "all"}
          options={[
            { value: "all", label: "Todos os clientes" },
            ...companies.map((company) => ({
              value: company.id,
              label: company.label,
            })),
          ]}
          onChange={(event) => {
            const nextCompanyId =
              event.target.value === "all" ? "" : event.target.value;
            setCompanyId(nextCompanyId);
            setValue("unitId", "", { shouldValidate: false });
          }}
        />
        <Select
          label="Unidade"
          required
          disabled={isSaving || unitsQuery.isLoading}
          options={units.map((unit) => ({
            value: unit.id,
            label: unit.name,
          }))}
          error={errors.unitId?.message}
          {...register("unitId")}
        />

        <div className={styles.actions}>
          <Button
            text="Iniciar implantação"
            type="submit"
            loading={isSaving}
            textLoading="Criando..."
            disabled={isSaving}
          />
        </div>
      </form>

      {templatesQuery.data?.data.length === 0 ? (
        <p className={styles.hint}>
          Não há templates publicados. Publique um template antes de iniciar uma
          implantação.
        </p>
      ) : null}

      {selectedUnit ? <UnitContextCard unit={selectedUnit} /> : null}
    </PageContainer>
  );
}
