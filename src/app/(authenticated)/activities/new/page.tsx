"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import Select from "@/components/ui/Select/Select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import { emptyToNull } from "@/features/implementations/schemas/create-implementation.schema";
import { activitiesApi } from "@/services/api/activities/activities.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { implementationsApi } from "@/services/api/implementations/implementations.api";

import styles from "../../implementations/new/page.module.css";

export default function NewActivityPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const canAccess = hasPermission(PERMISSIONS.ACTIVITIES_CREATE);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("none");
  const [unitId, setUnitId] = useState("none");
  const [implementationId, setImplementationId] = useState("none");
  const [isSaving, setIsSaving] = useState(false);

  const companiesQuery = useQuery({
    queryKey: ["implementation-companies"],
    queryFn: () => implementationsApi.listCompanies(),
    enabled: canAccess && hasPermission(PERMISSIONS.IMPLEMENTATIONS),
  });
  const unitsQuery = useQuery({
    queryKey: ["implementation-units", companyId],
    queryFn: () =>
      implementationsApi.listUnits(companyId === "none" ? undefined : companyId),
    enabled: canAccess && hasPermission(PERMISSIONS.IMPLEMENTATIONS),
  });
  const implementationsQuery = useQuery({
    queryKey: ["implementations", "picker"],
    queryFn: () => implementationsApi.findAll({ page: 1, pageSize: 100 }),
    enabled: canAccess && hasPermission(PERMISSIONS.IMPLEMENTATIONS),
  });

  if (!canAccess) {
    return (
      <PageContainer>
        <PageState
          type="forbidden"
          title="Sem permissão para criar atividades"
          description="Esta ação exige a permissão de criação de atividades."
        />
      </PageContainer>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome da atividade.");
      return;
    }
    try {
      setIsSaving(true);
      const response = await activitiesApi.create({
        name: name.trim(),
        description: emptyToNull(description),
        companyId: emptyToNull(companyId),
        unitId: emptyToNull(unitId),
        implementationId: emptyToNull(implementationId),
        stageId: null,
      });
      toast.success("Atividade criada.");
      router.push(`/activities/${response.data.id}`);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível criar a atividade.",
      );
      setIsSaving(false);
    }
  }

  const canPickContext = hasPermission(PERMISSIONS.IMPLEMENTATIONS);

  return (
    <PageContainer>
      <PageHeader
        title="Nova atividade"
        description="A atividade existe por conta própria. Cliente, unidade e implantação são opcionais."
        action={
          <Button variant="outline" text="Voltar" onClick={() => router.push("/activities")} />
        }
      />
      <form className={styles.form} onSubmit={onSubmit}>
        <Input label="Nome" required value={name} onChange={(event) => setName(event.target.value)} />
        <Input
          label="Descrição"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {canPickContext ? (
          <>
            <Select
              label="Cliente"
              value={companyId}
              options={[
                { value: "none", label: "Sem cliente" },
                ...(companiesQuery.data?.data ?? []).map((company) => ({
                  value: company.id,
                  label: company.tradeName,
                })),
              ]}
              onChange={(event) => {
                setCompanyId(event.target.value);
                setUnitId("none");
              }}
            />
            <Select
              label="Unidade"
              value={unitId}
              options={[
                { value: "none", label: "Sem unidade" },
                ...(unitsQuery.data?.data ?? []).map((unit) => ({
                  value: unit.id,
                  label: unit.name,
                })),
              ]}
              onChange={(event) => setUnitId(event.target.value)}
            />
            <Select
              label="Implantação"
              value={implementationId}
              options={[
                { value: "none", label: "Atividade independente" },
                ...(implementationsQuery.data?.data.items ?? []).map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
              onChange={(event) => setImplementationId(event.target.value)}
            />
          </>
        ) : null}
        <div className={styles.actions}>
          <Button
            text="Criar atividade"
            type="submit"
            loading={isSaving}
            textLoading="Criando..."
            disabled={isSaving}
          />
        </div>
      </form>
    </PageContainer>
  );
}
