"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CaretDown,
  CaretRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  FileText,
  ListChecks,
  Plus,
  SquaresFour,
} from "@phosphor-icons/react";

import Drawer from "@/components/layout/Drawer/Drawer";
import { PageHeader } from "@/components/layout/PageHeader/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import CheckBoxInput from "@/components/ui/CheckBoxInput/CheckBoxInput";
import FormSection from "@/components/ui/FormSection/FormSection";
import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import Input from "@/components/ui/Input/Input";
import IconButton from "@/components/ui/IconButton/IconButton";
import { List } from "@/components/ui/List/List";
import Modal from "@/components/ui/Modal/Modal";
import PageState from "@/components/ui/PageState/PageState";
import Select from "@/components/ui/Select/Select";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Tabs from "@/components/ui/Tabs/Tabs";
import Textarea from "@/components/ui/Textarea/Textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import {
  ImplementationStatusColor,
  ImplementationStatusLabel,
} from "@/constants/enums/implementations/implementation-status.enum";
import {
  ImplementationWorkStatusColor,
  ImplementationWorkStatusLabel,
} from "@/constants/enums/implementations/implementation-work-status.enum";
import { ActivityRequirementTypeLabel } from "@/constants/enums/templates/activity-requirement-type.enum";
import { EvidenceTypeLabel } from "@/constants/enums/templates/evidence-type";
import UnitContextCard from "@/features/implementations/components/UnitContextCard/UnitContextCard";
import { activitiesApi } from "@/services/api/activities/activities.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { implementationsApi } from "@/services/api/implementations/implementations.api";
import type {
  ImplementationActivity,
  ImplementationStage,
} from "@/services/api/implementations/implementations.types";
import type { TabItem } from "@/components/ui/Tabs/Tabs";

import styles from "./page.module.css";

type Tab = "overview" | "work" | "documents" | "history";
type DrawerMode =
  | "implementation"
  | "stage"
  | "editStage"
  | "activity"
  | "editActivity"
  | "link"
  | null;
type Confirmation = { kind: "stage"; stage: ImplementationStage } | { kind: "cancel" } | null;

const tabs: TabItem[] = [
  { value: "overview", label: "Visão geral" },
  { value: "work", label: "Etapas e atividades" },
  { value: "documents", label: "Documentos" },
  { value: "history", label: "Histórico" },
];

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError
    ? getApiErrorMessage(error.code, error.message)
    : fallback;
}

function formatDate(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Não informado";
}

function formatDateTime(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Não informado";
}

function getActivities(
  stages: ImplementationStage[],
  directActivities: ImplementationActivity[],
) {
  return [...directActivities, ...stages.flatMap((stage) => stage.activities)];
}

function getProgress(activities: ImplementationActivity[]) {
  if (!activities.length) return 0;
  return Math.round(
    (activities.filter((activity) => activity.status === "COMPLETED").length /
      activities.length) *
      100,
  );
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
  const canManageStages = hasPermission(
    PERMISSIONS.IMPLEMENTATIONS_MANAGE_STAGES,
  );
  const canCreateActivity = hasPermission(PERMISSIONS.ACTIVITIES_CREATE);
  const canUpdateActivity = hasPermission(PERMISSIONS.ACTIVITIES_UPDATE);
  const canLinkActivity = hasPermission(PERMISSIONS.ACTIVITIES_LINK);
  const canCancel = hasPermission(PERMISSIONS.IMPLEMENTATIONS_CANCEL);
  const canUpdateImplementation = hasPermission(
    PERMISSIONS.IMPLEMENTATIONS_UPDATE,
  );

  const [tab, setTab] = useState<Tab>("overview");
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    () => new Set(),
  );
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [busy, setBusy] = useState(false);
  const [implementationName, setImplementationName] = useState("");
  const [implementationDescription, setImplementationDescription] =
    useState("");
  const [stageName, setStageName] = useState("");
  const [stageDescription, setStageDescription] = useState("");
  const [editingStage, setEditingStage] = useState<ImplementationStage | null>(
    null,
  );
  const [activityName, setActivityName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityStageId, setActivityStageId] = useState("none");
  const [editingActivity, setEditingActivity] =
    useState<ImplementationActivity | null>(null);
  const [linkActivityId, setLinkActivityId] = useState("");
  const [linkStageId, setLinkStageId] = useState("none");
  const [acknowledgeCompleted, setAcknowledgeCompleted] = useState(false);

  const implementationQuery = useQuery({
    queryKey: ["implementation", id],
    queryFn: () => implementationsApi.findById(id),
    enabled: canAccess,
  });
  const independentQuery = useQuery({
    queryKey: ["activities", "independent"],
    queryFn: () => activitiesApi.findAll({ scope: "independent", pageSize: 100 }),
    enabled: canAccess && canLinkActivity,
  });
  const implementation = implementationQuery.data?.data;
  const activities = useMemo(
    () =>
      implementation
        ? getActivities(
            implementation.stages,
            implementation.directActivities,
          )
        : [],
    [implementation],
  );
  const completedActivities = activities.filter(
    (activity) => activity.status === "COMPLETED",
  ).length;
  const completion = getProgress(activities);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["implementation", id] });
    await queryClient.invalidateQueries({ queryKey: ["activities"] });
  }

  function toggleStage(stageId: string) {
    setExpandedStages((current) => {
      const next = new Set(current);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }

  function closeDrawer() {
    if (busy) return;
    setDrawer(null);
    setEditingStage(null);
    setEditingActivity(null);
  }

  async function saveImplementation() {
    if (!implementationName.trim()) return;
    try {
      setBusy(true);
      await implementationsApi.update(id, {
        name: implementationName.trim(),
        description: implementationDescription.trim() || null,
      });
      setDrawer(null);
      toast.success("Implantação atualizada.");
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível atualizar a implantação."));
    } finally {
      setBusy(false);
    }
  }

  async function saveStage() {
    if (!stageName.trim()) return;
    try {
      setBusy(true);
      if (editingStage) {
        await implementationsApi.updateStage(id, editingStage.id, {
          name: stageName.trim(),
          description: stageDescription.trim() || null,
        });
      } else {
        await implementationsApi.createStage(id, {
          name: stageName.trim(),
          description: stageDescription.trim() || null,
        });
      }
      setDrawer(null);
      setEditingStage(null);
      toast.success(editingStage ? "Etapa atualizada." : "Etapa adicionada.");
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível salvar a etapa."));
    } finally {
      setBusy(false);
    }
  }

  async function saveActivity() {
    if (!activityName.trim()) return;
    try {
      setBusy(true);
      if (editingActivity) {
        await activitiesApi.update(editingActivity.id, {
          name: activityName.trim(),
          description: activityDescription.trim() || null,
        });
      } else {
        await activitiesApi.create({
          name: activityName.trim(),
          description: activityDescription.trim() || null,
          companyId: null,
          unitId: null,
          implementationId: id,
          stageId: activityStageId === "none" ? null : activityStageId,
        });
      }
      setDrawer(null);
      setEditingActivity(null);
      toast.success(
        editingActivity ? "Atividade atualizada." : "Atividade adicionada.",
      );
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível salvar a atividade."));
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
      setDrawer(null);
      setLinkActivityId("");
      setAcknowledgeCompleted(false);
      toast.success("Atividade vinculada sem criar uma cópia.");
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível vincular a atividade."));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDestructiveAction() {
    if (!confirmation) return;
    try {
      setBusy(true);
      if (confirmation.kind === "stage") {
        await implementationsApi.deleteStage(id, confirmation.stage.id);
        toast.success("Etapa excluída.");
      } else {
        await implementationsApi.cancel(id);
        toast.success("Implantação cancelada.");
      }
      setConfirmation(null);
      await refresh();
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          confirmation.kind === "stage"
            ? "Não foi possível excluir a etapa. Verifique se ela contém atividades."
            : "Não foi possível cancelar a implantação.",
        ),
      );
    } finally {
      setBusy(false);
    }
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
  if (implementationQuery.isError || !implementation) {
    return (
      <PageContainer>
        <PageState
          type="error"
          title="Não foi possível carregar a implantação"
          action={{ label: "Voltar", onClick: () => router.push("/implementations") }}
        />
      </PageContainer>
    );
  }

  const stageOptions = [
    { value: "none", label: "Atividade direta, sem etapa" },
    ...implementation.stages.map((stage) => ({
      value: stage.id,
      label: stage.name,
    })),
  ];
  const independentActivities = independentQuery.data?.data.items ?? [];
  const location = [
    implementation.unit?.address?.city,
    implementation.unit?.address?.state,
  ]
    .filter(Boolean)
    .join(" / ");
  const history = [
    {
      id: "created",
      label: "Implantação criada",
      at: formatDateTime(implementation.createdAt),
    },
    {
      id: "updated",
      label: "Última atualização registrada",
      at: formatDateTime(implementation.updatedAt),
    },
  ];

  const summaryActions = (
    <>
      {canUpdateImplementation ? (
        <Button
          variant="outline"
          text="Editar"
          onClick={() => {
            setImplementationName(implementation.name);
            setImplementationDescription(implementation.description || "");
            setDrawer("implementation");
          }}
        />
      ) : null}
      {canCancel && implementation.status !== "CANCELLED" ? (
        <Button
          variant="outline"
          text="Cancelar implantação"
          disabled={busy}
          onClick={() => setConfirmation({ kind: "cancel" })}
        />
      ) : null}
    </>
  );

  return (
    <PageContainer>
      <div className={styles.page}>
        <PageHeader
          title={implementation.name}
          description={
            implementation.description ||
            `Início em ${formatDate(implementation.startedAt)}.`
          }
          breadcrumb={
            <>
              <Link href="/implementations">Implantações</Link>
              <span aria-hidden="true"> / </span>
              <span>{implementation.name}</span>
            </>
          }
          actions={
            <div className={styles.headerActions}>
              <StatusBadge
                label={ImplementationStatusLabel(implementation.status)}
                color={ImplementationStatusColor(implementation.status)}
              />
              {summaryActions}
            </div>
          }
        />

        <Card title="Dados principais" display="grid">
          <InfoCardGrid className={styles.facts}>
            <InfoField label="Unidade" value={implementation.captured.unitName} />
            {location ? <InfoField label="Localização" value={location} /> : null}
            <InfoField label="Data de início" value={formatDate(implementation.startedAt)} />
            <InfoField label="Previsão de conclusão" value="Não informada" />
            <InfoField label="Responsável" value="Não informado" />
          </InfoCardGrid>
        </Card>

        <InfoCardGrid className={styles.metrics}>
          <Card title="Progresso" icon={<CheckCircle size={20} />} display="default">
            <strong className={styles.metricValue}>{completion}%</strong>
            <span>{completedActivities} de {activities.length} atividades concluídas</span>
          </Card>
          <Card title="Etapas" icon={<SquaresFour size={20} />} display="default">
            <strong className={styles.metricValue}>{implementation.stages.length}</strong>
            <span>Etapas cadastradas</span>
          </Card>
          <Card title="Atividades" icon={<ListChecks size={20} />} display="default">
            <strong className={styles.metricValue}>{activities.length}</strong>
            <span>{implementation.directActivities.length} sem etapa</span>
          </Card>
        </InfoCardGrid>

        <Tabs
          items={tabs}
          value={tab}
          onChange={(value) => setTab(value as Tab)}
        />

        {tab === "overview" ? (
          <div className={styles.sections} role="tabpanel" id="panel-overview">
            <Card title="Andamento da implantação" display="default">
              <div className={styles.progressSummary}>
                <strong className={styles.metricValue}>{completion}%</strong>
                <span>{completedActivities} de {activities.length} atividades concluídas</span>
                <progress value={completion} max={100} aria-label="Progresso da implantação" />
              </div>
            </Card>
            <Card title="Informações gerais" icon={<SquaresFour size={20} />} display="default">
              <InfoCardGrid>
                <InfoField label="Cliente" value={implementation.captured.companyTradeName} />
                <InfoField label="Unidade" value={implementation.captured.unitName} />
                <InfoField label="Provedor" value={implementation.captured.initialProvider?.name} />
                <InfoField label="Responsável" value="Não informado" />
                <InfoField label="Template" value={implementation.template?.name} />
              </InfoCardGrid>
            </Card>
            {implementation.unit ? (
              <UnitContextCard
                unit={implementation.unit}
                capturedName={implementation.captured.unitName}
                initialProviderName={implementation.captured.initialProvider?.name}
              />
            ) : null}
            <Card title="Cronograma" icon={<CalendarBlank size={20} />} display="default">
              <InfoCardGrid>
                <InfoField label="Data de início" value={formatDate(implementation.startedAt)} />
                <InfoField label="Previsão de conclusão" value="Não informada" />
                <InfoField label="Conclusão efetiva" value={formatDate(implementation.completedAt)} />
                <InfoField label="Situação atual" value={ImplementationStatusLabel(implementation.status)} />
              </InfoCardGrid>
            </Card>
            <Card
              title="Etapas"
              display="default"
              actions={canManageStages ? <Button variant="outline" text={<><Plus size={16} /> Adicionar etapa</>} onClick={() => { setEditingStage(null); setStageName(""); setStageDescription(""); setDrawer("stage"); }} /> : undefined}
            >
              {implementation.stages.length ? (
                <List
                  items={implementation.stages}
                  keyExtractor={(stage) => stage.id}
                  getItem={(stage) => ({
                    title: stage.name,
                    subtitle: `${getProgress(stage.activities)}% · ${ImplementationWorkStatusLabel(stage.status)}`,
                    description: `${stage.activities.length} ${stage.activities.length === 1 ? "atividade" : "atividades"}`,
                  })}
                />
              ) : (
                <PageState
                  type="empty"
                  title="Nenhuma etapa cadastrada"
                  description="Adicione uma etapa para organizar as atividades desta implantação."
                  action={canManageStages ? { label: "Criar primeira etapa", onClick: () => { setStageName(""); setDrawer("stage"); } } : undefined}
                />
              )}
            </Card>
            <Card title="Últimas atualizações" display="default" actions={<Button variant="outline" text="Ver histórico" onClick={() => setTab("history")} />}>
              <List
                items={history}
                keyExtractor={(item) => item.id}
                getItem={(item) => ({ title: item.label, subtitle: item.at, description: "" })}
              />
              <p className={styles.note}>A API não informa o autor nem os detalhes das alterações.</p>
            </Card>
          </div>
        ) : null}

        {tab === "work" ? (
          <div className={styles.sections} role="tabpanel" id="panel-work">
            <Card
              title="Etapas e atividades"
              display="default"
              description="Acompanhe o progresso e gerencie as atividades do processo."
              actions={<div className={styles.headerActions}>{canCreateActivity ? <Button variant="outline" text={<><Plus size={16} /> Atividade</>} onClick={() => { setEditingActivity(null); setActivityName(""); setActivityDescription(""); setActivityStageId("none"); setDrawer("activity"); }} /> : null}{canManageStages ? <Button text={<><Plus size={16} /> Etapa</>} onClick={() => { setEditingStage(null); setStageName(""); setStageDescription(""); setDrawer("stage"); }} /> : null}</div>}
            >
              {!implementation.stages.length ? (
                <PageState
                  type="empty"
                  title="Nenhuma etapa cadastrada"
                  description="As atividades podem ser criadas diretamente ou organizadas em etapas."
                />
              ) : (
                <section className={styles.stages} aria-label="Etapas da implantação">
                  {implementation.stages.map((stage, index) => {
                    const expanded = expandedStages.has(stage.id);
                    return (
                      <article className={styles.stage} key={stage.id}>
                        <div className={styles.stageHeader}>
                          <button
                            type="button"
                            className={styles.stageToggle}
                            aria-expanded={expanded}
                            onClick={() => toggleStage(stage.id)}
                          >
                            {expanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
                            <span className={styles.stageName}>{index + 1}. {stage.name}</span>
                            <span className={styles.stageCount}>{stage.activities.length} {stage.activities.length === 1 ? "atividade" : "atividades"}</span>
                            <span className={styles.stageProgress}>{getProgress(stage.activities)}%</span>
                            <StatusBadge label={ImplementationWorkStatusLabel(stage.status)} color={ImplementationWorkStatusColor(stage.status)} />
                          </button>
                          {canManageStages ? (
                            <div className={styles.rowActions}>
                              <IconButton action="edit" size="sm" label="Editar etapa" onClick={() => { setEditingStage(stage); setStageName(stage.name); setStageDescription(stage.description || ""); setDrawer("editStage"); }} />
                              <IconButton action="delete" size="sm" label="Excluir etapa" onClick={() => setConfirmation({ kind: "stage", stage })} />
                            </div>
                          ) : null}
                        </div>
                      <div className={styles.stageMeter}>
                        <progress value={getProgress(stage.activities)} max={100} aria-label={`Progresso da etapa ${stage.name}`} />
                      </div>
                        {expanded ? (
                          <div className={styles.stageContent}>
                            {stage.activities.length ? (
                              <List
                                items={stage.activities}
                                keyExtractor={(activity) => activity.id}
                                getItem={getActivityListItem}
                                renderActions={(activity) => (
                                  <div className={styles.listActions}>
                                    {canUpdateActivity ? <Button variant="outline" text="Editar" onClick={() => { setEditingActivity(activity); setActivityName(activity.name); setActivityDescription(activity.description || ""); setDrawer("editActivity"); }} /> : null}
                                    <Link href={`/activities/${activity.id}`}>Abrir</Link>
                                  </div>
                                )}
                              />
                            ) : (
                              <PageState type="empty" title="Etapa sem atividades" description="Adicione uma atividade para começar o trabalho desta etapa." />
                            )}
                            {canCreateActivity ? (
                              <div className={styles.addActivity}>
                                <Button variant="outline" text="Adicionar atividade" onClick={() => { setActivityStageId(stage.id); setActivityName(""); setActivityDescription(""); setDrawer("activity"); }} />
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </section>
              )}
              <Card title="Atividades diretas" description="Atividades vinculadas à implantação sem uma etapa." display="default" actions={<div className={styles.headerActions}>{canLinkActivity ? <Button variant="outline" text="Vincular existente" onClick={() => { setLinkActivityId(""); setLinkStageId("none"); setDrawer("link"); }} /> : null}{canCreateActivity ? <Button variant="outline" text={<><Plus size={16} /> Adicionar</>} onClick={() => { setActivityStageId("none"); setActivityName(""); setActivityDescription(""); setDrawer("activity"); }} /> : null}</div>}>
                {implementation.directActivities.length ? (
                  <List
                    items={implementation.directActivities}
                    keyExtractor={(activity) => activity.id}
                    getItem={getActivityListItem}
                    renderActions={(activity) => (
                      <div className={styles.listActions}>
                        {canUpdateActivity ? <Button variant="outline" text="Editar" onClick={() => { setEditingActivity(activity); setActivityName(activity.name); setActivityDescription(activity.description || ""); setDrawer("editActivity"); }} /> : null}
                        <Link href={`/activities/${activity.id}`}>Abrir</Link>
                      </div>
                    )}
                  />
                ) : <PageState type="empty" title="Nenhuma atividade direta" description="Crie uma atividade direta ou vincule uma atividade existente." />}
              </Card>
            </Card>
          </div>
        ) : null}

        {tab === "documents" ? (
          <Card title="Documentos e evidências" icon={<FileText size={20} />}>
            <PageState
              type="empty"
              title="Não há documentos vinculados à implantação"
              description="A API atual não disponibiliza uma coleção de documentos da implantação. Evidências exigidas aparecem nos requisitos das atividades."
            />
          </Card>
        ) : null}

        {tab === "history" ? (
          <Card title="Histórico da implantação" icon={<Clock size={20} />} display="default">
            <List
              items={history}
              keyExtractor={(item) => item.id}
              getItem={(item) => ({ title: item.label, subtitle: item.at, description: "" })}
            />
            <p className={styles.note}>O backend fornece as datas de criação e atualização, mas não disponibiliza usuário, tipo do evento ou descrição da alteração.</p>
          </Card>
        ) : null}
      </div>

      <Drawer
        open={drawer !== null}
        onClose={closeDrawer}
        title={drawerTitle(drawer)}
        description={drawer === "link" ? "A atividade mantém o mesmo identificador, requisitos e responsáveis." : undefined}
        footer={
          <div className={styles.drawerActions}>
            <Button variant="secondary" text="Cancelar" onClick={closeDrawer} disabled={busy} />
            <Button
              text={busy ? "Salvando..." : drawer === "link" ? "Vincular" : drawer === "stage" || drawer === "editStage" ? "Salvar etapa" : drawer === "activity" || drawer === "editActivity" ? "Salvar atividade" : "Salvar"}
              loading={busy}
              disabled={busy || !drawerValid(drawer, implementationName, stageName, activityName, linkActivityId)}
              onClick={drawer === "implementation" ? saveImplementation : drawer === "stage" || drawer === "editStage" ? saveStage : drawer === "activity" || drawer === "editActivity" ? saveActivity : linkActivity}
            />
          </div>
        }
      >
        {drawer === "implementation" ? (
          <FormSection isContentGrid={false}>
            <Input label="Nome da implantação" value={implementationName} onChange={(event) => setImplementationName(event.target.value)} required maxLength={255} />
            <Textarea label="Descrição" value={implementationDescription} onChange={(event) => setImplementationDescription(event.target.value)} maxLength={5000} />
          </FormSection>
        ) : null}
        {drawer === "stage" || drawer === "editStage" ? (
          <FormSection isContentGrid={false}>
            <Input label="Nome da etapa" value={stageName} onChange={(event) => setStageName(event.target.value)} required maxLength={255} />
            <Textarea label="Descrição" value={stageDescription} onChange={(event) => setStageDescription(event.target.value)} maxLength={5000} />
          </FormSection>
        ) : null}
        {drawer === "activity" || drawer === "editActivity" ? (
          <FormSection isContentGrid={false}>
            <Input label="Nome da atividade" value={activityName} onChange={(event) => setActivityName(event.target.value)} required maxLength={255} />
            <Textarea label="Descrição" value={activityDescription} onChange={(event) => setActivityDescription(event.target.value)} maxLength={5000} />
            {drawer === "activity" ? <Select label="Etapa" value={activityStageId} options={stageOptions} onChange={(event) => setActivityStageId(event.target.value)} /> : null}
          </FormSection>
        ) : null}
        {drawer === "link" ? (
          <FormSection isContentGrid={false}>
            <Select label="Atividade independente" value={linkActivityId} options={independentActivities.map((activity) => ({ value: activity.id, label: activity.name }))} onChange={(event) => setLinkActivityId(event.target.value)} />
            <Select label="Destino" value={linkStageId} options={stageOptions} onChange={(event) => setLinkStageId(event.target.value)} />
            <CheckBoxInput label="Confirmo a vinculação mesmo se a atividade já estiver concluída" checked={acknowledgeCompleted} onChange={(event) => setAcknowledgeCompleted(event.target.checked)} />
          </FormSection>
        ) : null}
      </Drawer>

      <Modal
        open={confirmation !== null}
        title={confirmation?.kind === "stage" ? "Excluir etapa" : "Cancelar implantação"}
        description={confirmation?.kind === "stage" ? `Deseja excluir a etapa “${confirmation.stage.name}”? A operação seguirá as regras de integridade do backend.` : "Deseja cancelar esta implantação?"}
        confirmText={confirmation?.kind === "stage" ? "Excluir etapa" : "Cancelar implantação"}
        variant="danger"
        isLoading={busy}
        onClose={() => { if (!busy) setConfirmation(null); }}
        onConfirm={confirmDestructiveAction}
      />
    </PageContainer>
  );
}

function getActivityListItem(activity: ImplementationActivity) {
  const assignments = activity.assignments.map((item) => `${item.userName} (${item.role === "SUPERVISOR" ? "Supervisor" : "Executor"})`);
  const requirements = activity.requirements.map((item) => `${ActivityRequirementTypeLabel(item.type)}${item.isRequired ? (["EVIDENCE", "FORM", "QUANTITY", "ENGINEER_APPROVAL"].includes(item.type) ? " obrigatória" : " obrigatório") : " opcional"}`);
  const evidenceTypes = activity.requirements.flatMap((item) =>
    item.evidenceTypes.map((evidence) => EvidenceTypeLabel(evidence.type)),
  );
  const forms = activity.formSnapshots.map((form) => form.name);
  return {
    title: <Link href={`/activities/${activity.id}`}>{activity.name}</Link>,
    subtitle: <span className={styles.activitySubtitle}><StatusBadge label={ImplementationWorkStatusLabel(activity.status)} color={ImplementationWorkStatusColor(activity.status)} /> <span>{assignments.length ? `Responsáveis: ${assignments.join(", ")}` : "Nenhum responsável atribuído"}</span></span>,
    description: `${activity.description ? `${activity.description} · ` : ""}${requirements.length ? `Requisitos: ${requirements.join(", ")}` : "Sem requisitos configurados"}${evidenceTypes.length ? ` · Evidências aceitas: ${[...new Set(evidenceTypes)].join(", ")}` : ""}${forms.length ? ` · Formulários: ${forms.join(", ")}` : ""}`,
  };
}

function drawerTitle(drawer: DrawerMode) {
  switch (drawer) {
    case "implementation": return "Editar implantação";
    case "stage": return "Adicionar etapa";
    case "editStage": return "Editar etapa";
    case "activity": return "Adicionar atividade";
    case "editActivity": return "Editar atividade";
    case "link": return "Vincular atividade existente";
    default: return "";
  }
}

function drawerValid(drawer: DrawerMode, implementationName: string, stageName: string, activityName: string, linkActivityId: string) {
  if (drawer === "implementation") return Boolean(implementationName.trim());
  if (drawer === "stage" || drawer === "editStage") return Boolean(stageName.trim());
  if (drawer === "activity" || drawer === "editActivity") return Boolean(activityName.trim());
  if (drawer === "link") return Boolean(linkActivityId);
  return false;
}
