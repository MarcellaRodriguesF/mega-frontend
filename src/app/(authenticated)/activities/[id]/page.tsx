"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import InfoField from "@/components/ui/InfoField/InfoField";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import Select from "@/components/ui/Select/Select";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import {
  ImplementationWorkStatusColor,
  ImplementationWorkStatusLabel,
} from "@/constants/enums/implementations/implementation-work-status.enum";
import { activitiesApi } from "@/services/api/activities/activities.api";
import type { AssignmentRole } from "@/services/api/activities/activities.types";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { implementationsApi } from "@/services/api/implementations/implementations.api";

import styles from "../../implementations/[id]/page.module.css";

const roleLabel = {
  EXECUTOR: "Executor",
  SUPERVISOR: "Supervisor",
} as const;

function messageFrom(error: unknown, fallback: string) {
  return error instanceof ApiError
    ? getApiErrorMessage(error.code, error.message)
    : fallback;
}

export default function ActivityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { hasPermission } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canAccess = hasPermission(PERMISSIONS.ACTIVITIES);
  const canAssign = hasPermission(PERMISSIONS.ACTIVITIES_ASSIGN);
  const canExecute = hasPermission(PERMISSIONS.ACTIVITIES_EXECUTE) || hasPermission(PERMISSIONS.ACTIVITIES_MANAGE);
  const canComplete = hasPermission(PERMISSIONS.ACTIVITIES_COMPLETE) || hasPermission(PERMISSIONS.ACTIVITIES_MANAGE);
  const canLink = hasPermission(PERMISSIONS.ACTIVITIES_LINK);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AssignmentRole>("EXECUTOR");
  const [implementationId, setImplementationId] = useState("");
  const [stageId, setStageId] = useState("none");
  const [acknowledgeCompleted, setAcknowledgeCompleted] = useState(false);
  const [busy, setBusy] = useState(false);

  const activityQuery = useQuery({
    queryKey: ["activity", id],
    queryFn: () => activitiesApi.findById(id),
    enabled: canAccess,
  });
  const usersQuery = useQuery({
    queryKey: ["activity-users"],
    queryFn: () => activitiesApi.listAssignableUsers(),
    enabled: canAccess && canAssign,
  });
  const implementationsQuery = useQuery({
    queryKey: ["implementations", "picker"],
    queryFn: () => implementationsApi.findAll({ page: 1, pageSize: 100 }),
    enabled: canAccess && canLink && hasPermission(PERMISSIONS.IMPLEMENTATIONS),
  });
  const linkedImplementationId = activityQuery.data?.data.implementation?.id;
  const linkedImplementationQuery = useQuery({
    queryKey: ["implementation", linkedImplementationId],
    queryFn: () => implementationsApi.findById(linkedImplementationId ?? ""),
    enabled:
      Boolean(linkedImplementationId) &&
      canLink &&
      hasPermission(PERMISSIONS.IMPLEMENTATIONS),
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["activity", id] });
    await queryClient.invalidateQueries({ queryKey: ["activities"] });
    await queryClient.invalidateQueries({ queryKey: ["implementation"] });
  }

  async function run(action: () => Promise<unknown>, success: string, fallback: string) {
    try {
      setBusy(true);
      await action();
      toast.success(success);
      await refresh();
    } catch (error) {
      toast.error(messageFrom(error, fallback));
    } finally {
      setBusy(false);
    }
  }

  if (!canAccess) {
    return (
      <PageContainer>
        <PageState
          type="forbidden"
          title="Sem permissão para atividades"
          description="Esta área é restrita a usuários com acesso ao módulo de atividades."
        />
      </PageContainer>
    );
  }

  if (activityQuery.isLoading) {
    return (
      <PageContainer>
        <PageState type="loading" title="Carregando atividade" />
      </PageContainer>
    );
  }

  if (activityQuery.isError || !activityQuery.data) {
    return (
      <PageContainer>
        <PageState
          type="error"
          title="Não foi possível carregar a atividade"
          action={{ label: "Voltar", onClick: () => router.push("/activities") }}
        />
      </PageContainer>
    );
  }

  const activity = activityQuery.data.data;

  return (
    <PageContainer>
      <PageHeader
        title={activity.name}
        description={activity.description || "Atividade operacional."}
        action={
          <div className={styles.actions}>
            <StatusBadge
              label={ImplementationWorkStatusLabel(activity.status)}
              color={ImplementationWorkStatusColor(activity.status)}
            />
            {canExecute && activity.status !== "COMPLETED" ? (
              <Button
                text="Iniciar"
                disabled={busy || activity.status === "IN_PROGRESS"}
                onClick={() =>
                  run(() => activitiesApi.start(id), "Execução iniciada.", "Não foi possível iniciar.")
                }
              />
            ) : null}
            {canComplete && activity.status !== "COMPLETED" ? (
              <Button
                text="Concluir"
                disabled={busy}
                onClick={() =>
                  run(
                    () => activitiesApi.complete(id),
                    "Atividade concluída.",
                    "Não foi possível concluir.",
                  )
                }
              />
            ) : null}
            <Button variant="outline" text="Voltar" onClick={() => router.push("/activities")} />
          </div>
        }
      />

      <Card title="Contexto">
        <InfoField
          label="Implantação"
          value={
            activity.implementation ? (
              <Link href={`/implementations/${activity.implementation.id}`}>
                {activity.implementation.name}
              </Link>
            ) : (
              "Independente"
            )
          }
        />
        <InfoField label="Etapa" value={activity.stage?.name || "Sem etapa"} />
        <InfoField label="Cliente" value={activity.companyTradeName || "Não informado"} />
        <InfoField label="Unidade" value={activity.unitName || "Não informada"} />
      </Card>

      <Card title="Responsáveis">
        {activity.assignments.length === 0 ? (
          <p>Nenhum responsável atribuído.</p>
        ) : (
          activity.assignments.map((assignment) => (
            <div className={styles.actions} key={assignment.id}>
              <span>
                {assignment.userName} · {roleLabel[assignment.role]}
              </span>
              {canAssign ? (
                <Button
                  variant="outline"
                  text="Remover"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => activitiesApi.removeAssignment(id, assignment.id),
                      "Atribuição removida.",
                      "Não foi possível remover a atribuição.",
                    )
                  }
                />
              ) : null}
            </div>
          ))
        )}
        {canAssign ? (
          <div className={styles.actions}>
            <Select
              label="Usuário"
              value={userId}
              options={(usersQuery.data?.data ?? []).map((user) => ({
                value: user.id,
                label: user.name?.trim() || user.email,
              }))}
              onChange={(event) => setUserId(event.target.value)}
            />
            <Select
              label="Papel"
              value={role}
              options={[
                { value: "EXECUTOR", label: "Executor" },
                { value: "SUPERVISOR", label: "Supervisor" },
              ]}
              onChange={(event) => setRole(event.target.value as AssignmentRole)}
            />
            <Button
              text="Atribuir"
              disabled={busy || !userId}
              onClick={() =>
                run(
                  () => activitiesApi.assign(id, { userId, role }),
                  "Responsável atribuído.",
                  "Não foi possível atribuir.",
                )
              }
            />
          </div>
        ) : null}
      </Card>

      <Card title="Requisitos e formulários">
        {activity.requirements.length === 0 ? <p>Sem requisitos.</p> : null}
        {activity.requirements.map((requirement) => (
          <p key={requirement.id}>
            {requirement.type}
            {requirement.isRequired ? " · obrigatório" : " · opcional"}
          </p>
        ))}
        {activity.formSnapshots.map((form) => (
          <p key={form.id}>
            {form.name} · {form.fields.length} campo(s). O preenchimento ainda não está disponível.
          </p>
        ))}
      </Card>

      {canLink ? (
        <Card
          title={activity.independent ? "Vincular a uma implantação" : "Mover ou desvincular"}
          description="O vínculo usa a mesma atividade. Uma atividade concluída exige confirmação explícita."
        >
          {activity.independent && hasPermission(PERMISSIONS.IMPLEMENTATIONS) ? (
            <div className={styles.actions}>
              <Select
                label="Implantação"
                value={implementationId}
                options={(implementationsQuery.data?.data.items ?? []).map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                onChange={(event) => setImplementationId(event.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={acknowledgeCompleted}
                  onChange={(event) => setAcknowledgeCompleted(event.target.checked)}
                />{" "}
                Confirmo a movimentação de atividade concluída
              </label>
              <Button
                text="Vincular"
                disabled={busy || !implementationId}
                onClick={() =>
                  run(
                    () =>
                      activitiesApi.place(id, {
                        implementationId,
                        stageId: null,
                        acknowledgeCompleted,
                        reason: "Vinculada pela atividade",
                      }),
                    "Atividade vinculada.",
                    "Não foi possível vincular.",
                  )
                }
              />
            </div>
          ) : null}
          {!activity.independent && activity.implementation ? (
            <div className={styles.actions}>
              <Select
                label="Mover nesta implantação"
                value={stageId}
                options={[
                  { value: "none", label: "Atividade direta, sem etapa" },
                  ...(linkedImplementationQuery.data?.data.stages ?? []).map((stage) => ({
                    value: stage.id,
                    label: stage.name,
                  })),
                ]}
                onChange={(event) => setStageId(event.target.value)}
              />
              <Button
                text="Mover"
                disabled={busy}
                onClick={() =>
                  run(
                    () =>
                      activitiesApi.place(id, {
                        implementationId: activity.implementation!.id,
                        stageId: stageId === "none" ? null : stageId,
                        acknowledgeCompleted,
                        reason: "Movida dentro da implantação",
                      }),
                    "Atividade movida.",
                    "Não foi possível mover a atividade.",
                  )
                }
              />
              <Button
                variant="outline"
                text="Desvincular"
                disabled={busy}
                onClick={() =>
                  run(
                    () =>
                      activitiesApi.detach(id, {
                        acknowledgeCompleted,
                        reason: "Desvinculada pela atividade",
                      }),
                    "Atividade desvinculada.",
                    "Não foi possível desvincular.",
                  )
                }
              />
            </div>
          ) : null}
          {activity.status === "COMPLETED" && !activity.independent ? (
            <label>
              <input
                type="checkbox"
                checked={acknowledgeCompleted}
                onChange={(event) => setAcknowledgeCompleted(event.target.checked)}
              />{" "}
              Confirmo a desvinculação de atividade concluída
            </label>
          ) : null}
        </Card>
      ) : null}

      {activity.placements.length > 0 ? (
        <Card title="Histórico de posicionamento">
          {activity.placements.map((placement) => (
            <p key={placement.id}>
              {placement.fromImplementationName || "Independente"}
              {placement.fromStageName ? ` / ${placement.fromStageName}` : ""} →{" "}
              {placement.toImplementationName || "Independente"}
              {placement.toStageName ? ` / ${placement.toStageName}` : ""} · {placement.userName}
              {placement.explicitConfirmation ? " · confirmação explícita" : ""}
              {placement.reason ? ` · ${placement.reason}` : ""}
            </p>
          ))}
        </Card>
      ) : null}
    </PageContainer>
  );
}
