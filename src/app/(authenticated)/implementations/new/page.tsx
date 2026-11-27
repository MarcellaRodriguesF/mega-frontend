"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
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
  emptyToNull,
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
  const [isSaving, setIsSaving] = useState(false);
  const canAccess = hasPermission(PERMISSIONS.IMPLEMENTATIONS_CREATE);

  const templatesQuery = useQuery({
    queryKey: ["implementation-templates"],
    queryFn: () => implementationsApi.listPublishedTemplates(),
    enabled: canAccess,
  });

  const companiesQuery = useQuery({
    queryKey: ["implementation-companies"],
    queryFn: () => implementationsApi.listCompanies(),
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
      name: "",
      description: "",
      templateId: "",
      companyId: "",
      unitId: "",
    },
  });

  const companyId = useWatch({ control, name: "companyId" });
  const templateId = useWatch({ control, name: "templateId" });
  const selectedUnitId = useWatch({ control, name: "unitId" });

  const unitsQuery = useQuery({
    queryKey: ["implementation-units", companyId],
    queryFn: () => implementationsApi.listUnits(companyId || undefined),
    enabled: canAccess,
  });

  const previewQuery = useQuery({
    queryKey: ["implementation-template-preview", templateId],
    queryFn: () => implementationsApi.previewTemplate(templateId),
    enabled: canAccess && templateId !== "" && templateId !== "none",
  });

  const units = unitsQuery.data?.data ?? [];
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId) ?? null;

  if (!canAccess) {
    return (
      <PageContainer>
        <PageState
          type="forbidden"
          title="Sem permissão para criar implantações"
          description="Esta ação exige a permissão de criação de implantações."
        />
      </PageContainer>
    );
  }

  async function onSubmit(data: CreateImplementationFormValues) {
    try {
      setIsSaving(true);
      const response = await implementationsApi.create({
        name: data.name.trim(),
        description: emptyToNull(data.description),
        templateId: emptyToNull(data.templateId),
        companyId: emptyToNull(data.companyId),
        unitId: emptyToNull(data.unitId),
      });
      toast.success("A implantação foi criada.");
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

  const preview = previewQuery.data?.data;

  return (
    <PageContainer>
      <PageHeader
        title="Nova implantação"
        description="O nome é obrigatório. Template, cliente e unidade são opcionais. Se houver unidade, o cliente é resolvido por ela."
        action={
          <Button
            variant="outline"
            text="Voltar"
            onClick={() => router.push("/implementations")}
          />
        }
      />

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Nome"
          required
          disabled={isSaving}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Descrição"
          disabled={isSaving}
          error={errors.description?.message}
          {...register("description")}
        />
        <Select
          label="Template publicado"
          placeholder="Sem template"
          disabled={isSaving || templatesQuery.isLoading}
          options={[
            { value: "none", label: "Sem template" },
            ...(templatesQuery.data?.data ?? []).map((template) => ({
              value: template.id,
              label: template.name,
            })),
          ]}
          error={errors.templateId?.message}
          {...register("templateId", {
            onChange: () => undefined,
          })}
        />
        <Select
          label="Cliente"
          placeholder="Sem cliente"
          disabled={isSaving || companiesQuery.isLoading}
          options={[
            { value: "none", label: "Sem cliente" },
            ...(companiesQuery.data?.data ?? []).map((company) => ({
              value: company.id,
              label: company.tradeName,
            })),
          ]}
          error={errors.companyId?.message}
          {...register("companyId", {
            onChange: () => setValue("unitId", ""),
          })}
        />
        <Select
          label="Unidade"
          placeholder="Sem unidade"
          disabled={isSaving || unitsQuery.isLoading}
          options={[
            { value: "none", label: "Sem unidade" },
            ...units.map((unit) => ({
              value: unit.id,
              label: unit.name,
            })),
          ]}
          error={errors.unitId?.message}
          {...register("unitId")}
        />

        <div className={styles.actions}>
          <Button
            text="Criar implantação"
            type="submit"
            loading={isSaving}
            textLoading="Criando..."
            disabled={isSaving}
          />
        </div>
      </form>

      {preview ? (
        <section>
          <p className={styles.hint}>
            Pré-visualização de {preview.name}. Esta estrutura será copiada; o
            template original continua independente.
          </p>
          <ul className={styles.hint}>
            {preview.stages.map((stage) => (
              <li key={stage.id}>
                {stage.name}: {stage.activities.map((activity) => activity.name).join(", ") || "sem atividades"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {selectedUnit ? <UnitContextCard unit={selectedUnit} /> : null}
    </PageContainer>
  );
}
