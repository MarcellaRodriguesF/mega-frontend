"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import InfoField from "@/components/ui/InfoField/InfoField";
import Input from "@/components/ui/Input/Input";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import Select from "@/components/ui/Select/Select";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import {
  ImplementationStatusColor,
  ImplementationStatusLabel,
} from "@/constants/enums/implementations/implementation-status.enum";
import ImplementationStructure from "@/features/implementations/components/ImplementationStructure/ImplementationStructure";
import UnitContextCard from "@/features/implementations/components/UnitContextCard/UnitContextCard";
import { formatUpdatedAt } from "@/features/templates/template-utils";
import { activitiesApi } from "@/services/api/activities/activities.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { implementationsApi } from "@/services/api/implementations/implementations.api";

import styles from "./page.module.css";

function messageFrom(error: unknown, fallback: string) {
  return error instanceof ApiError
    ? getApiErrorMessage(error.code, error.message)
    : fallback;
}

export default function ImplementationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { hasPermission } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canAccess = hasPermission(PERMISSIONS.IMPLEMENTATIONS);
  const canManageStages = hasPermission(PERMISSIONS.IMPLEMENTATIONS_MANAGE_STAGES);
  const canCreateActivity = hasPermission(PERMISSIONS.ACTIVITIES_CREATE);
  const canLink = hasPermission(PERMISSIONS.ACTIVITIES_LINK);
  const canCancel = hasPermission(PERMISSIONS.IMPLEMENTATIONS_CANCEL);
  const [stageName, setStageName] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityStageId, setActivityStageId] = useState("none");
  const [linkActivityId, setLinkActivityId] = useState("");
  const [linkStageId, setLinkStageId] = useState("none");
  const [acknowledgeCompleted, setAcknowledgeCompleted] = useState(false);
  const [busy, setBusy] = useState(false);

  const implementationQuery = useQuery({
    queryKey: ["implementation", id],
    queryFn: () => implementationsApi.findById(id),
    enabled: canAccess,
  });

  const independentQuery = useQuery({
    queryKey: ["activities", "independent"],
    queryFn: () => activitiesApi.findAll({ scope: "independent", pageSize: 100 }),
    enabled: canAccess && canLink,
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["implementation", id] });
    await queryClient.invalidateQueries({ queryKey: ["activities"] });
  }

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

  if (implementationQuery.isLoading) {
    return (
      <PageContainer>
        <PageState type="loading" title="Carregando implantação" />
      </PageContainer>
    );
  }

  if (implementationQuery.isError || !implementationQuery.data) {
    return (
      <PageContainer>
        <PageState
          type="error"
          title="Não foi possível carregar a implantação"
          action={{
            label: "Voltar",
            onClick: () => router.push("/implementations"),
          }}
        />
      </PageContainer>
    );
  }

  const implementation = implementationQuery.data.data;
  const stageOptions = [
    { value: "none", label: "Atividade direta, sem etapa" },
    ...implementation.stages.map((stage) => ({
      value: stage.id,
      label: stage.name,
    })),
  ];

  async function addStage() {
    if (!stageName.trim()) return;
    try {
      setBusy(true);
      await implementationsApi.createStage(id, {
        name: stageName.trim(),
        description: null,
      });
      setStageName("");
      toast.success("Etapa adicionada.");
      await refresh();
    } catch (error) {
      toast.error(messageFrom(error, "Não foi possível adicionar a etapa."));
    } finally {
      setBusy(false);
    }
  }

  async function addActivity() {
    if (!activityName.trim()) return;
    try {
      setBusy(true);
      await activitiesApi.create({
        name: activityName.trim(),
        description: null,
        companyId: null,
        unitId: null,
        implementationId: id,
        stageId: activityStageId === "none" ? null : activityStageId,
      });
      setActivityName("");
      toast.success("Atividade adicionada a esta implantação.");
      await refresh();
    } catch (error) {
      toast.error(messageFrom(error, "Não foi possível adicionar a atividade."));
    } finally {
      setBusy(false);
    }
  }

  async function linkActivity() {
    if (!linkActivityId) return;
    try {
      setBusy(true);
      await activitiesApi.place(linkActivityId, {
        implementationId: id,
        stageId: linkStageId === "none" ? null : linkStageId,
        acknowledgeCompleted,
        reason: "Vinculada pela implantação",
      });
      setLinkActivityId("");
      setAcknowledgeCompleted(false);
      toast.success("Atividade vinculada sem criar uma cópia.");
      await refresh();
    } catch (error) {
      toast.error(messageFrom(error, "Não foi possível vincular a atividade."));
    } finally {
      setBusy(false);
    }
  }

  async function cancelImplementation() {
    try {
      setBusy(true);
      await implementationsApi.cancel(id);
      toast.success("Implantação cancelada.");
      await refresh();
    } catch (error) {
      toast.error(messageFrom(error, "Não foi possível cancelar a implantação."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={implementation.name}
        description={
          implementation.description ||
          `Início em ${formatUpdatedAt(implementation.startedAt)}.`
        }
        action={
          <div className={styles.actions}>
            <StatusBadge
              label={ImplementationStatusLabel(implementation.status)}
              color={ImplementationStatusColor(implementation.status)}
            />
            {canCancel && implementation.status !== "CANCELLED" ? (
              <Button
                variant="outline"
                text="Cancelar"
                disabled={busy}
                onClick={cancelImplementation}
              />
            ) : null}
            <Button
              variant="outline"
              text="Voltar"
              onClick={() => router.push("/implementations")}
            />
          </div>
        }
      />

      <Card title="Contexto registrado na criação">
        <InfoField
          label="Cliente"
          value={implementation.captured.companyTradeName || "Não informado"}
        />
        <InfoField
          label="Unidade"
          value={implementation.captured.unitName || "Não informada"}
        />
        <InfoField
          label="Template"
          value={implementation.template?.name || "Sem template"}
        />
        <InfoField
          label="Provedor identificado no início"
          value={implementation.captured.initialProvider?.name || "Não vinculado"}
        />
      </Card>

      {implementation.unit ? (
        <UnitContextCard
          unit={implementation.unit}
          capturedName={implementation.captured.unitName}
          initialProviderName={implementation.captured.initialProvider?.name}
        />
      ) : null}

      <ImplementationStructure implementation={implementation} />

      {canManageStages ? (
        <Card title="Nova etapa" description="A etapa passa a fazer parte deste processo.">
          <div className={styles.actions}>
            <Input
              label="Nome da etapa"
              value={stageName}
              onChange={(event) => setStageName(event.target.value)}
            />
            <Button text="Adicionar etapa" disabled={busy} onClick={addStage} />
          </div>
        </Card>
      ) : null}

      {canCreateActivity ? (
        <Card
          title="Nova atividade neste processo"
          description="Pode ficar direta na implantação ou dentro de uma etapa."
        >
          <div className={styles.actions}>
            <Input
              label="Nome da atividade"
              value={activityName}
              onChange={(event) => setActivityName(event.target.value)}
            />
            <Select
              label="Etapa"
              value={activityStageId}
              options={stageOptions}
              onChange={(event) => setActivityStageId(event.target.value)}
            />
            <Button text="Adicionar atividade" disabled={busy} onClick={addActivity} />
          </div>
        </Card>
      ) : null}

      {canLink ? (
        <Card
          title="Vincular atividade existente"
          description="A atividade mantém o mesmo identificador, responsáveis, requisitos, formulários, respostas e evidências."
        >
          <div className={styles.actions}>
            <Select
              label="Atividade independente"
              value={linkActivityId}
              options={(independentQuery.data?.data.items ?? []).map((activity) => ({
                value: activity.id,
                label: activity.name,
              }))}
              onChange={(event) => setLinkActivityId(event.target.value)}
            />
            <Select
              label="Destino"
              value={linkStageId}
              options={stageOptions}
              onChange={(event) => setLinkStageId(event.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={acknowledgeCompleted}
                onChange={(event) => setAcknowledgeCompleted(event.target.checked)}
              />{" "}
              Confirmo a vinculação mesmo se a atividade já estiver concluída
            </label>
            <Button text="Vincular" disabled={busy || !linkActivityId} onClick={linkActivity} />
          </div>
        </Card>
      ) : null}
    </PageContainer>
  );
}
