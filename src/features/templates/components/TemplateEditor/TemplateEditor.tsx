"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CaretDown, CaretRight, DotsSixVertical } from "@phosphor-icons/react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";

import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { templatesApi } from "@/services/api/templates/templates.api";
import type {
  ActivityRequirement,
  TemplateActivity,
  TemplateDetail,
  TemplateStage,
} from "@/services/api/templates/templates.types";
import {
  TemplateStatus,
  TemplateStatusColor,
  TemplateStatusLabel,
} from "@/constants/enums/templates/template-status.enum";

import NamedItemDrawer from "../NamedItemDrawer/NamedItemDrawer";
import NamedItemForm from "../NamedItemForm/NamedItemForm";
import ActivitySettingsDrawer from "../ActivitySettingsDrawer/ActivitySettingsDrawer";
import InlineField from "../InlineField/InlineField";
import RequirementIndicators from "../RequirementIndicators/RequirementIndicators";
import type { NamedItemData } from "../../schemas/named-item.schema";
import type { RequirementFormData } from "../../schemas/requirement-form.schema";
import {
  collectChanges,
  hasChanges,
  isDraftDirty,
  mergeDraft,
  moveBefore,
  toDraft,
  type TemplateDraft,
} from "../../template-draft";

import styles from "./TemplateEditor.module.css";

interface TemplateEditorProps {
  templateId: string;
}

type DragItem =
  | { kind: "stage"; id: string }
  | { kind: "activity"; stageId: string; id: string };

type DeleteState =
  | { kind: "template" }
  | { kind: "stage"; stage: TemplateStage }
  | { kind: "activity"; stageId: string; activity: TemplateActivity }
  | {
      kind: "requirement";
      stageId: string;
      activityId: string;
      requirement: ActivityRequirement;
    }
  | null;

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return getApiErrorMessage(error.code, error.message);
  }

  return fallback;
}

function findStage(template: TemplateDetail, stageId: string) {
  return template.stages.find((stage) => stage.id === stageId) ?? null;
}

function findActivity(template: TemplateDetail, activityId: string) {
  for (const stage of template.stages) {
    const activity = stage.activities.find((item) => item.id === activityId);
    if (activity) return activity;
  }

  return null;
}

export default function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const dragRef = useRef<DragItem | null>(null);
  const impactActionRef = useRef<(() => Promise<void>) | null>(null);
  const impactCancelRef = useRef<(() => void) | null>(null);
  const [draft, setDraft] = useState<TemplateDraft | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [createDrawer, setCreateDrawer] = useState<
    | { kind: "stage" }
    | { kind: "activity"; stageId: string }
    | { kind: "stage-description"; stageId: string }
    | null
  >(null);
  const [settingsActivity, setSettingsActivity] = useState<{
    stageId: string;
    activityId: string;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeleteState>(null);
  const [impactOpen, setImpactOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const templateQuery = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => templatesApi.findById(templateId),
  });

  const template = templateQuery.data?.data ?? null;
  const serverDraft = template ? toDraft(template) : null;
  const serverSignature = serverDraft ? JSON.stringify(serverDraft) : null;
  const [seenSignature, setSeenSignature] = useState<string | null>(null);

  if (serverSignature !== seenSignature) {
    setSeenSignature(serverSignature);
    if (serverDraft) {
      setDraft((current) =>
        current ? mergeDraft(current, serverDraft) : serverDraft
      );
    }
  }

  const dirty = draft && serverDraft ? isDraftDirty(draft, serverDraft) : false;

  useEffect(() => {
    if (!dirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["template", templateId] }),
      queryClient.invalidateQueries({ queryKey: ["templates"] }),
    ]);
  }

  function updateDraft(recipe: (current: TemplateDraft) => TemplateDraft) {
    setDraft((current) => (current ? recipe(current) : current));
  }

  function withPublishedWarning(action: () => Promise<void>) {
    if (template?.status !== TemplateStatus.PUBLISHED) {
      return action().then(
        () => true,
        () => false
      );
    }

    return new Promise<boolean>((resolve) => {
      impactActionRef.current = async () => {
        try {
          await action();
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      impactCancelRef.current = () => resolve(false);
      setImpactOpen(true);
    });
  }

  async function persist() {
    if (!template || !draft || !serverDraft) return;

    const changes = collectChanges(draft, serverDraft);

    if (!hasChanges(changes)) return;

    const names = [
      draft.name,
      ...Object.values(draft.stages).map((stage) => stage.name),
      ...Object.values(draft.activities).map((activity) => activity.name),
    ];

    if (names.some((name) => name.trim().length === 0)) {
      toast.error("Preencha os nomes obrigatórios antes de salvar.");
      return;
    }

    setIsSaving(true);
    const failures: string[] = [];

    try {
      if (changes.template) {
        try {
          await templatesApi.update(templateId, changes.template);
        } catch (error) {
          failures.push(
            errorMessage(error, "Não foi possível salvar os dados do template.")
          );
        }
      }

      for (const stage of changes.stages) {
        try {
          await templatesApi.updateStage(templateId, stage.id, {
            name: stage.name,
            description: stage.description,
          });
        } catch (error) {
          failures.push(
            errorMessage(
              error,
              `Não foi possível salvar a etapa ${stage.name}.`
            )
          );
        }
      }

      if (changes.stageOrder) {
        try {
          await templatesApi.reorderStages(templateId, {
            ids: changes.stageOrder,
          });
        } catch (error) {
          failures.push(
            errorMessage(error, "Não foi possível salvar a ordem das etapas.")
          );
        }
      }

      for (const activity of changes.activities) {
        try {
          await templatesApi.updateActivity(
            templateId,
            activity.stageId,
            activity.id,
            {
              name: activity.name,
              description: activity.description,
            }
          );
        } catch (error) {
          failures.push(
            errorMessage(
              error,
              `Não foi possível salvar a atividade ${activity.name}.`
            )
          );
        }
      }

      for (const order of changes.activityOrders) {
        try {
          await templatesApi.reorderActivities(templateId, order.stageId, {
            ids: order.ids,
          });
        } catch (error) {
          failures.push(
            errorMessage(
              error,
              "Não foi possível salvar a ordem das atividades."
            )
          );
        }
      }

      await refresh();

      if (failures.length === 0) {
        toast.success("As alterações do template foram salvas.");
      } else {
        toast.error(failures[0] ?? "Algumas alterações não foram salvas.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function saveTemplateDetails(data: NamedItemData) {
    try {
      setIsSavingTemplate(true);
      const saved = await withPublishedWarning(async () => {
        try {
          await templatesApi.update(templateId, data);
          updateDraft((current) => ({
            ...current,
            name: data.name,
            description: data.description,
          }));
          toast.success("O template foi atualizado.");
          setTemplateDrawerOpen(false);
          await refresh();
        } catch (error) {
          toast.error(
            errorMessage(error, "Não foi possível atualizar o template.")
          );
          throw error;
        }
      });

      if (!saved) return;
    } finally {
      setIsSavingTemplate(false);
    }
  }

  async function updateStatus(status: TemplateStatus) {
    if (dirty) {
      toast.error("Salve ou descarte as alterações antes de mudar o status.");
      return;
    }

    try {
      setIsStatusUpdating(true);
      await templatesApi.updateStatus(templateId, { status });
      toast.success("O status do template foi atualizado.");
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível atualizar o status."));
    } finally {
      setIsStatusUpdating(false);
    }
  }

  async function confirmDelete(deletion: DeleteState) {
    if (!deletion) return;

    try {
      setIsDeleting(true);

      if (deletion.kind === "template") {
        await templatesApi.delete(templateId);
        toast.success("O template foi excluído.");
        router.push("/templates");
        return;
      }

      if (deletion.kind === "stage") {
        await templatesApi.deleteStage(templateId, deletion.stage.id);
      }

      if (deletion.kind === "activity") {
        await templatesApi.deleteActivity(
          templateId,
          deletion.stageId,
          deletion.activity.id
        );
      }

      if (deletion.kind === "requirement") {
        await templatesApi.deleteRequirement(
          templateId,
          deletion.stageId,
          deletion.activityId,
          deletion.requirement.id
        );
      }

      toast.success("Registro excluído com sucesso.");
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível excluir o registro."));
    } finally {
      setIsDeleting(false);
    }
  }

  function toggleStage(stageId: string) {
    setExpandedStages((current) => {
      const next = new Set(current);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }

  function dropStage(targetId: string) {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "stage") return;

    updateDraft((current) => ({
      ...current,
      stageIds: moveBefore(current.stageIds, drag.id, targetId),
    }));
    dragRef.current = null;
  }

  function dropActivity(stageId: string, targetId: string) {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "activity" || drag.stageId !== stageId) return;

    updateDraft((current) => {
      const stage = current.stages[stageId];
      if (!stage) return current;

      return {
        ...current,
        stages: {
          ...current.stages,
          [stageId]: {
            ...stage,
            activityIds: moveBefore(stage.activityIds, drag.id, targetId),
          },
        },
      };
    });
    dragRef.current = null;
  }

  if (templateQuery.isLoading || !draft || !template) {
    if (templateQuery.isError || (!templateQuery.isLoading && !template)) {
      return (
        <PageContainer>
          <PageState
            type="error"
            title="Não foi possível carregar o template"
            description="Verifique sua permissão ou tente novamente."
            action={{
              label: "Tentar novamente",
              onClick: () => templateQuery.refetch(),
            }}
          />
        </PageContainer>
      );
    }

    return (
      <PageContainer>
        <PageState type="loading" title="Carregando template" />
      </PageContainer>
    );
  }

  const activityCount = draft.stageIds.reduce(
    (total, stageId) =>
      total + (draft.stages[stageId]?.activityIds.length ?? 0),
    0
  );
  const settings = settingsActivity
    ? findActivity(template, settingsActivity.activityId)
    : null;
  const settingsDraft = settingsActivity
    ? draft.activities[settingsActivity.activityId]
    : null;
  const descriptionStage =
    createDrawer?.kind === "stage-description"
      ? draft.stages[createDrawer.stageId]
      : null;

  return (
    <PageContainer>
      <PageHeader
        title={draft.name}
        description={draft.description ?? undefined}
        action={
          <>
            <IconButton
              action="edit"
              size="md"
              onClick={() => setTemplateDrawerOpen(true)}
            />
            <IconButton
              action="delete"
              size="md"
              onClick={() => {
                if (dirty) {
                  toast.error(
                    "Salve ou descarte as alterações antes de excluir o template."
                  );
                  return;
                }
                setPendingDelete({ kind: "template" });
              }}
            />
            <div className={styles.topActions}>
              <Button
                text="Salvar alterações"
                loading={isSaving}
                textLoading="Salvando..."
                disabled={!dirty || isSaving}
                onClick={() => withPublishedWarning(persist)}
              />
              {dirty ? (
                <Button
                  variant="secondary"
                  text="Descartar"
                  onClick={() => setDraft(toDraft(template))}
                  disabled={isSaving}
                />
              ) : null}
              {dirty ? (
                <span className={styles.pending}>Alterações não salvas</span>
              ) : null}
            </div>
            <div className={styles.topBar}></div>
          </>
        }
      />

      <header className={styles.header}>
        <div className={styles.meta}>
          <StatusBadge
            label={TemplateStatusLabel(template.status)}
            color={TemplateStatusColor(template.status)}
          />
          <span>
            {draft.stageIds.length}{" "}
            {draft.stageIds.length === 1 ? "etapa" : "etapas"}
          </span>
          <span>
            {activityCount} {activityCount === 1 ? "atividade" : "atividades"}
          </span>
          {template.status === TemplateStatus.ARCHIVED ? (
            <span>Arquivado: indisponível para novas utilizações.</span>
          ) : null}
        </div>
      </header>

      <section className={styles.stages} aria-label="Etapas do template">
        {draft.stageIds.length === 0 ? (
          <p className={styles.empty}>Nenhuma etapa cadastrada.</p>
        ) : (
          draft.stageIds.map((stageId, stageIndex) => {
            const stage = draft.stages[stageId];
            const serverStage = findStage(template, stageId);
            if (!stage || !serverStage) return null;

            const expanded = expandedStages.has(stageId);

            return (
              <article
                className={styles.stage}
                key={stageId}
                onDragOver={(event) => {
                  if (dragRef.current?.kind !== "stage") return;
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  dropStage(stageId);
                }}
              >
                <div
                  className={styles.stageHeader}
                  onClick={(event) => {
                    const target = event.target;
                    if (!(target instanceof Element)) return;
                    if (
                      target.closest(
                        "button, input, textarea, a, [data-drag-handle]"
                      )
                    )
                      return;
                    toggleStage(stageId);
                  }}
                >
                  <span
                    className={styles.handle}
                    data-drag-handle
                    draggable
                    aria-label="Reordenar etapa"
                    onDragStart={(event) => {
                      dragRef.current = { kind: "stage", id: stageId };
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", stageId);
                    }}
                    onDragEnd={() => {
                      dragRef.current = null;
                    }}
                  >
                    <DotsSixVertical size={18} />
                  </span>
                  <span className={styles.index}>{stageIndex + 1}</span>
                  <div className={styles.stageName}>
                    <InlineField
                      value={stage.name}
                      ariaLabel={`Nome da etapa ${stageIndex + 1}`}
                      required
                      onCommit={(name) =>
                        updateDraft((current) => {
                          const currentStage = current.stages[stageId];
                          if (!currentStage) return current;

                          return {
                            ...current,
                            stages: {
                              ...current.stages,
                              [stageId]: { ...currentStage, name },
                            },
                          };
                        })
                      }
                    />
                  </div>
                  <span className={styles.count}>
                    {stage.activityIds.length}{" "}
                    {stage.activityIds.length === 1
                      ? "atividade"
                      : "atividades"}
                  </span>
                  <button
                    type="button"
                    className={styles.expand}
                    aria-expanded={expanded}
                    aria-label={expanded ? "Recolher etapa" : "Expandir etapa"}
                    onClick={() => toggleStage(stageId)}
                  >
                    {expanded ? (
                      <CaretDown size={16} />
                    ) : (
                      <CaretRight size={16} />
                    )}
                  </button>
                  <div className={styles.rowActions}>
                    <IconButton
                      action="edit"
                      size="sm"
                      label="Editar etapa"
                      onClick={() =>
                        setCreateDrawer({ kind: "stage-description", stageId })
                      }
                    />
                    <IconButton
                      action="delete"
                      size="sm"
                      label="Excluir etapa"
                      onClick={() =>
                        setPendingDelete({ kind: "stage", stage: serverStage })
                      }
                    />
                  </div>
                </div>

                {expanded ? (
                  <div className={styles.activities}>
                    {stage.activityIds.length === 0 ? (
                      <p className={styles.empty}>
                        Nenhuma atividade nesta etapa.
                      </p>
                    ) : (
                      stage.activityIds.map((activityId, activityIndex) => {
                        const activity = draft.activities[activityId];
                        const serverActivity = findActivity(
                          template,
                          activityId
                        );
                        if (!activity || !serverActivity) return null;

                        return (
                          <div
                            className={styles.activity}
                            key={activityId}
                            onClick={(event) => {
                              const target = event.target;
                              if (!(target instanceof Element)) return;
                              if (
                                target.closest(
                                  "button, input, textarea, a, [data-drag-handle]"
                                )
                              )
                                return;
                              setSettingsActivity({ stageId, activityId });
                            }}
                            onDragOver={(event) => {
                              if (
                                dragRef.current?.kind !== "activity" ||
                                dragRef.current.stageId !== stageId
                              ) {
                                return;
                              }
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              dropActivity(stageId, activityId);
                            }}
                          >
                            <span
                              className={styles.handle}
                              data-drag-handle
                              draggable
                              aria-label="Reordenar atividade"
                              onDragStart={(event) => {
                                dragRef.current = {
                                  kind: "activity",
                                  stageId,
                                  id: activityId,
                                };
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData(
                                  "text/plain",
                                  activityId
                                );
                                event.stopPropagation();
                              }}
                              onDragEnd={() => {
                                dragRef.current = null;
                              }}
                            >
                              <DotsSixVertical size={16} />
                            </span>
                            <span className={styles.index}>
                              {stageIndex + 1}.{activityIndex + 1}
                            </span>
                            <div className={styles.activityMain}>
                              <InlineField
                                value={activity.name}
                                ariaLabel={`Nome da atividade ${stageIndex + 1}.${activityIndex + 1}`}
                                required
                                onCommit={(name) =>
                                  updateDraft((current) => {
                                    const currentActivity =
                                      current.activities[activityId];
                                    if (!currentActivity) return current;

                                    return {
                                      ...current,
                                      activities: {
                                        ...current.activities,
                                        [activityId]: {
                                          ...currentActivity,
                                          name,
                                        },
                                      },
                                    };
                                  })
                                }
                              />
                              <RequirementIndicators
                                requirements={serverActivity.requirements}
                              />
                            </div>
                            <div className={styles.rowActions}>
                              <IconButton
                                action="edit"
                                size="sm"
                                label="Editar atividade"
                                onClick={() =>
                                  setSettingsActivity({ stageId, activityId })
                                }
                              />
                              <IconButton
                                action="delete"
                                size="sm"
                                label="Excluir atividade"
                                onClick={() =>
                                  setPendingDelete({
                                    kind: "activity",
                                    stageId,
                                    activity: serverActivity,
                                  })
                                }
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div className={styles.addActivity}>
                      <Button
                        variant="outline"
                        text="Adicionar atividade"
                        onClick={() => {
                          setExpandedStages((current) =>
                            new Set(current).add(stageId)
                          );
                          setCreateDrawer({ kind: "activity", stageId });
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        )}

        <div className={styles.addStage}>
          <Button
            text="Adicionar etapa"
            onClick={() => setCreateDrawer({ kind: "stage" })}
          />
        </div>
      </section>

      <Drawer
        open={templateDrawerOpen}
        onClose={() => {
          if (!isSavingTemplate) setTemplateDrawerOpen(false);
        }}
        title="Editar template"
        description="Altere o nome e a descrição. Publicar e arquivar também ficam neste painel."
        footer={
          <div className={styles.drawerFooter}>
            <Button
              variant="secondary"
              text="Cancelar"
              onClick={() => setTemplateDrawerOpen(false)}
              disabled={isSavingTemplate}
            />
            <Button
              text="Salvar"
              type="submit"
              form="edit-template-form"
              loading={isSavingTemplate}
              textLoading="Salvando..."
            />
          </div>
        }
      >
        {templateDrawerOpen ? (
          <div className={styles.templateDrawer}>
            <div className={styles.templateStatus}>
              <StatusBadge
                label={TemplateStatusLabel(template.status)}
                color={TemplateStatusColor(template.status)}
              />
              <div className={styles.templateStatusActions}>
                {template.status !== TemplateStatus.PUBLISHED ? (
                  <Button
                    variant="outline"
                    text="Publicar"
                    loading={isStatusUpdating}
                    onClick={() => updateStatus(TemplateStatus.PUBLISHED)}
                  />
                ) : null}
                {template.status === TemplateStatus.ARCHIVED ? (
                  <Button
                    variant="outline"
                    text="Voltar para rascunho"
                    loading={isStatusUpdating}
                    onClick={() => updateStatus(TemplateStatus.DRAFT)}
                  />
                ) : null}
                {template.status !== TemplateStatus.ARCHIVED ? (
                  <Button
                    variant="secondary"
                    text="Arquivar"
                    loading={isStatusUpdating}
                    onClick={() => updateStatus(TemplateStatus.ARCHIVED)}
                  />
                ) : null}
              </div>
            </div>
            <NamedItemForm
              formId="edit-template-form"
              nameLabel="Nome do template"
              namePlaceholder="Ex.: Implantação padrão"
              defaultValues={{
                name: draft.name,
                description: draft.description ?? "",
              }}
              isLoading={isSavingTemplate}
              onSubmit={saveTemplateDetails}
            />
          </div>
        ) : null}
      </Drawer>

      <NamedItemDrawer
        open={createDrawer?.kind === "stage"}
        title="Nova etapa"
        description="A etapa será incluída no final da lista."
        nameLabel="Nome da etapa"
        namePlaceholder="Ex.: Infraestrutura"
        submitText="Adicionar etapa"
        formId="create-stage-form"
        onClose={() => setCreateDrawer(null)}
        onSubmit={async (data: NamedItemData) => {
          await withPublishedWarning(async () => {
            try {
              await templatesApi.createStage(templateId, data);
              toast.success("A etapa foi cadastrada.");
              setCreateDrawer(null);
              await refresh();
            } catch (error) {
              toast.error(
                errorMessage(error, "Não foi possível cadastrar a etapa.")
              );
              throw error;
            }
          });
        }}
      />

      <NamedItemDrawer
        open={
          createDrawer?.kind === "stage-description" &&
          Boolean(descriptionStage)
        }
        title="Descrição da etapa"
        description="A descrição entra nas alterações pendentes e só é gravada ao salvar o template."
        nameLabel="Nome da etapa"
        namePlaceholder="Nome da etapa"
        submitText="Aplicar no editor"
        formId="stage-description-form"
        defaultValues={
          descriptionStage
            ? {
                name: descriptionStage.name,
                description: descriptionStage.description ?? "",
              }
            : undefined
        }
        onClose={() => setCreateDrawer(null)}
        onSubmit={(data) => {
          if (createDrawer?.kind !== "stage-description") return;
          const stageId = createDrawer.stageId;
          updateDraft((current) => {
            const stage = current.stages[stageId];
            if (!stage) return current;
            return {
              ...current,
              stages: {
                ...current.stages,
                [stageId]: {
                  ...stage,
                  name: data.name,
                  description: data.description,
                },
              },
            };
          });
          setCreateDrawer(null);
          toast.success(
            "A etapa foi atualizada no editor. Salve as alterações para gravar."
          );
        }}
      />

      <NamedItemDrawer
        open={createDrawer?.kind === "activity"}
        title="Nova atividade"
        description="A atividade será incluída no final da etapa."
        nameLabel="Nome da atividade"
        namePlaceholder="Ex.: Lançamento de cabo"
        submitText="Adicionar atividade"
        formId="create-activity-form"
        onClose={() => setCreateDrawer(null)}
        onSubmit={async (data) => {
          if (createDrawer?.kind !== "activity") return;
          const stageId = createDrawer.stageId;
          await withPublishedWarning(async () => {
            try {
              await templatesApi.createActivity(templateId, stageId, data);
              toast.success("A atividade foi cadastrada.");
              setExpandedStages((current) => new Set(current).add(stageId));
              setCreateDrawer(null);
              await refresh();
            } catch (error) {
              toast.error(
                errorMessage(error, "Não foi possível cadastrar a atividade.")
              );
              throw error;
            }
          });
        }}
      />

      <ActivitySettingsDrawer
        open={Boolean(settings && settingsDraft && settingsActivity)}
        activityId={settingsActivity?.activityId ?? null}
        activityName={settingsDraft?.name ?? ""}
        activityDescription={settingsDraft?.description ?? null}
        requirements={settings?.requirements ?? []}
        onClose={() => setSettingsActivity(null)}
        onApply={(data) => {
          if (!settingsActivity) return;
          const activityId = settingsActivity.activityId;
          updateDraft((current) => {
            const activity = current.activities[activityId];
            if (!activity) return current;
            return {
              ...current,
              activities: {
                ...current.activities,
                [activityId]: {
                  ...activity,
                  name: data.name,
                  description: data.description,
                },
              },
            };
          });
          toast.success(
            "A atividade foi atualizada no editor. Salve as alterações para gravar."
          );
        }}
        onSaveRequirement={(requirement, data: RequirementFormData) => {
          if (!settingsActivity) return Promise.resolve(false);
          const { stageId, activityId } = settingsActivity;
          return withPublishedWarning(async () => {
            try {
              if (requirement) {
                await templatesApi.updateRequirement(
                  templateId,
                  stageId,
                  activityId,
                  requirement.id,
                  data
                );
                toast.success("O requisito foi atualizado.");
              } else {
                await templatesApi.createRequirement(
                  templateId,
                  stageId,
                  activityId,
                  data
                );
                toast.success("O requisito foi cadastrado.");
              }
              await refresh();
            } catch (error) {
              toast.error(
                errorMessage(error, "Não foi possível salvar o requisito.")
              );
              throw error;
            }
          });
        }}
        onDeleteRequirement={(requirement) => {
          if (!settingsActivity) return;
          setPendingDelete({
            kind: "requirement",
            stageId: settingsActivity.stageId,
            activityId: settingsActivity.activityId,
            requirement,
          });
        }}
        onReorderRequirements={async (ids) => {
          if (!settingsActivity) return;
          const { stageId, activityId } = settingsActivity;
          await withPublishedWarning(async () => {
            try {
              await templatesApi.reorderRequirements(
                templateId,
                stageId,
                activityId,
                { ids }
              );
              await refresh();
            } catch (error) {
              toast.error(
                errorMessage(error, "Não foi possível reordenar os requisitos.")
              );
              throw error;
            }
          });
        }}
      />

      <Modal
        open={impactOpen}
        title="Salvar template publicado"
        description="Este template está publicado e é compartilhado entre as empresas. As alterações poderão valer para futuras implantações que usarem este template. Implantações já criadas não são alteradas, porque cada uma utiliza a própria cópia da estrutura."
        confirmText="Continuar"
        isLoading={isSaving}
        onClose={() => {
          if (isSaving) return;
          setImpactOpen(false);
          impactCancelRef.current?.();
          impactCancelRef.current = null;
          impactActionRef.current = null;
        }}
        onConfirm={() => {
          const action = impactActionRef.current;
          impactCancelRef.current = null;
          impactActionRef.current = null;
          setImpactOpen(false);
          if (action) void action();
        }}
      />

      <Modal
        open={pendingDelete !== null}
        title="Confirmar exclusão"
        description={
          pendingDelete?.kind === "template"
            ? "O template e toda a sua estrutura serão excluídos."
            : "Esta exclusão não poderá ser desfeita."
        }
        confirmText="Excluir"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={() => {
          const deletion = pendingDelete;
          setPendingDelete(null);

          if (!deletion) return;

          if (
            template.status === TemplateStatus.PUBLISHED &&
            deletion.kind !== "template"
          ) {
            void withPublishedWarning(() => confirmDelete(deletion));
            return;
          }

          void confirmDelete(deletion);
        }}
        onClose={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
}
