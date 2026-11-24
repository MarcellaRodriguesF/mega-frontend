"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import Modal from "@/components/ui/Modal/Modal";
import PageState from "@/components/ui/PageState/PageState";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { templatesApi } from "@/services/api/templates/templates.api";
import type {
  ActivityRequirement,
  CompletionPercentageConfiguration,
  QuantityConfiguration,
  TemplateActivity,
  TemplateStage,
} from "@/services/api/templates/templates.types";
import {
  TemplateStatus,
  TemplateStatusColor,
  TemplateStatusLabel,
} from "@/constants/enums/templates/template-status.enum";
import { ActivityRequirementTypeLabel } from "@/constants/enums/templates/activity-requirement-type.enum";
import { EvidenceTypeLabel } from "@/constants/enums/templates/evidence-type";

import NamedItemDrawer from "../NamedItemDrawer/NamedItemDrawer";
import NamedItemForm from "../NamedItemForm/NamedItemForm";
import RequirementDrawer from "../RequirementDrawer/RequirementDrawer";
import type { NamedItemData } from "../../schemas/named-item.schema";
import type { RequirementFormData, RequirementFormInput } from "../../schemas/requirement-form.schema";
import { moveId } from "../../template-utils";

import styles from "./TemplateEditor.module.css";

interface TemplateEditorProps {
  templateId: string;
}

type DrawerState =
  | { kind: "stage"; stage?: TemplateStage }
  | { kind: "activity"; stageId: string; activity?: TemplateActivity }
  | { kind: "requirement"; stageId: string; activityId: string; requirement?: ActivityRequirement }
  | null;

type DeleteState =
  | { kind: "template" }
  | { kind: "stage"; stage: TemplateStage }
  | { kind: "activity"; stageId: string; activity: TemplateActivity }
  | { kind: "requirement"; stageId: string; activityId: string; requirement: ActivityRequirement }
  | null;

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return getApiErrorMessage(error.code, error.message);
  }

  return fallback;
}

function requirementDetails(requirement: ActivityRequirement) {
  if (requirement.type === "EVIDENCE") {
    const types = requirement.evidenceTypes.map((item) => EvidenceTypeLabel(item.type));
    return types.length > 0 ? types.join(", ") : "Nenhum tipo configurado";
  }

  if (requirement.type === "FORM") {
    return requirement.formTemplate?.name ?? "Formulário não informado";
  }

  if (requirement.type === "QUANTITY") {
    const configuration = requirement.configuration as QuantityConfiguration | null;
    return [configuration?.plannedQuantity, configuration?.unit].filter(Boolean).join(" ") || "Sem quantidade definida";
  }

  if (requirement.type === "COMPLETION_PERCENTAGE") {
    const configuration = requirement.configuration as CompletionPercentageConfiguration | null;
    return configuration ? `Mínimo de ${configuration.minimumPercentage}%` : "Percentual não informado";
  }

  return "Sem configuração adicional";
}

function toRequirementForm(requirement: ActivityRequirement): RequirementFormInput {
  const quantity =
    requirement.type === "QUANTITY"
      ? (requirement.configuration as QuantityConfiguration | null)
      : null;
  const completion =
    requirement.type === "COMPLETION_PERCENTAGE"
      ? (requirement.configuration as CompletionPercentageConfiguration | null)
      : null;

  return {
    type: requirement.type,
    isRequired: requirement.isRequired,
    evidenceTypes: requirement.evidenceTypes.map((item) => item.type),
    formTemplateId: requirement.formTemplateId ?? "",
    unit: quantity?.unit ?? "",
    plannedQuantity: quantity?.plannedQuantity?.toString() ?? "",
    minimumPercentage: completion?.minimumPercentage?.toString() ?? "",
  };
}

export default function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [pendingDelete, setPendingDelete] = useState<DeleteState>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const templateQuery = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => templatesApi.findById(templateId),
  });

  const template = templateQuery.data?.data;

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["template", templateId] }),
      queryClient.invalidateQueries({ queryKey: ["templates"] }),
    ]);
  }

  async function run(action: () => Promise<unknown>, success: string, fallback: string) {
    try {
      await action();
      toast.success(success);
      setDrawer(null);
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, fallback));
      throw error;
    }
  }

  async function updateStatus(status: TemplateStatus) {
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

  async function confirmDelete() {
    if (!pendingDelete || !template) return;

    try {
      setIsDeleting(true);

      if (pendingDelete.kind === "template") {
        await templatesApi.delete(templateId);
        toast.success("O template foi excluído.");
        router.push("/templates");
        return;
      }

      if (pendingDelete.kind === "stage") {
        await templatesApi.deleteStage(templateId, pendingDelete.stage.id);
      }

      if (pendingDelete.kind === "activity") {
        await templatesApi.deleteActivity(
          templateId,
          pendingDelete.stageId,
          pendingDelete.activity.id,
        );
      }

      if (pendingDelete.kind === "requirement") {
        await templatesApi.deleteRequirement(
          templateId,
          pendingDelete.stageId,
          pendingDelete.activityId,
          pendingDelete.requirement.id,
        );
      }

      toast.success("Registro excluído com sucesso.");
      setPendingDelete(null);
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível excluir o registro."));
    } finally {
      setIsDeleting(false);
    }
  }

  async function reorder(
    ids: string[] | null,
    action: (ids: string[]) => Promise<void>,
  ) {
    if (!ids) return;

    try {
      await action(ids);
      await refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível reordenar os itens."));
    }
  }

  if (templateQuery.isLoading) {
    return (
      <PageContainer>
        <PageState type="loading" title="Carregando template" />
      </PageContainer>
    );
  }

  if (templateQuery.isError || !template) {
    return (
      <PageContainer>
        <PageState
          type="error"
          title="Não foi possível carregar o template"
          description="Verifique sua permissão ou tente novamente."
          action={{ label: "Tentar novamente", onClick: () => templateQuery.refetch() }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={template.name}
        description="Edite a estrutura do template: etapas, atividades e requisitos de conclusão."
        action={
          <>
            <Link className={styles.link} href="/templates">
              Voltar
            </Link>
            {template.status !== TemplateStatus.PUBLISHED && (
              <Button
                text="Publicar"
                loading={isStatusUpdating}
                onClick={() => updateStatus(TemplateStatus.PUBLISHED)}
              />
            )}
            {template.status === TemplateStatus.ARCHIVED && (
              <Button
                variant="outline"
                text="Voltar para rascunho"
                loading={isStatusUpdating}
                onClick={() => updateStatus(TemplateStatus.DRAFT)}
              />
            )}
            {template.status !== TemplateStatus.ARCHIVED && (
              <Button
                variant="secondary"
                text="Arquivar"
                loading={isStatusUpdating}
                onClick={() => updateStatus(TemplateStatus.ARCHIVED)}
              />
            )}
            <Button
              variant="outline"
              text="Excluir"
              onClick={() => setPendingDelete({ kind: "template" })}
            />
          </>
        }
      />

      <div className={styles.statusRow}>
        <StatusBadge
          label={TemplateStatusLabel(template.status)}
          color={TemplateStatusColor(template.status)}
        />
        {template.status === TemplateStatus.ARCHIVED && (
          <p className={styles.note}>
            Templates arquivados não ficam disponíveis para novas utilizações.
          </p>
        )}
      </div>

      <section className={styles.panel}>
        <h2>Informações gerais</h2>
        <NamedItemForm
          key={`${template.id}-${template.updatedAt}`}
          formId="template-general-form"
          nameLabel="Nome do template"
          namePlaceholder="Ex.: Implantação de usina"
          defaultValues={{
            name: template.name,
            description: template.description ?? "",
          }}
          onSubmit={(data) =>
            run(
              () => templatesApi.update(templateId, data),
              "As informações do template foram atualizadas.",
              "Não foi possível atualizar o template.",
            )
          }
        />
        <div className={styles.formActions}>
          <Button text="Salvar informações" type="submit" form="template-general-form" />
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Etapas</h2>
            <p>Organize as etapas e, dentro delas, as atividades e os requisitos.</p>
          </div>
          <Button text="Nova etapa" onClick={() => setDrawer({ kind: "stage" })} />
        </div>

        {template.stages.length === 0 ? (
          <p className={styles.empty}>Nenhuma etapa cadastrada.</p>
        ) : (
          <div className={styles.stack}>
            {template.stages.map((stage) => (
              <article className={styles.stage} key={stage.id}>
                <header className={styles.itemHeader}>
                  <div>
                    <h3>{stage.name}</h3>
                    {stage.description && <p>{stage.description}</p>}
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.iconAction}
                      aria-label="Mover etapa para cima"
                      onClick={() =>
                        reorder(moveId(template.stages.map((item) => item.id), stage.id, -1), (ids) =>
                          templatesApi.reorderStages(templateId, { ids }),
                        )
                      }
                    >
                      <CaretUp size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconAction}
                      aria-label="Mover etapa para baixo"
                      onClick={() =>
                        reorder(moveId(template.stages.map((item) => item.id), stage.id, 1), (ids) =>
                          templatesApi.reorderStages(templateId, { ids }),
                        )
                      }
                    >
                      <CaretDown size={16} />
                    </button>
                    <IconButton
                      action="edit"
                      size="sm"
                      label="Editar etapa"
                      onClick={() => setDrawer({ kind: "stage", stage })}
                    />
                    <IconButton
                      action="delete"
                      size="sm"
                      label="Excluir etapa"
                      onClick={() => setPendingDelete({ kind: "stage", stage })}
                    />
                    <Button
                      variant="outline"
                      text="Nova atividade"
                      onClick={() => setDrawer({ kind: "activity", stageId: stage.id })}
                    />
                  </div>
                </header>

                {stage.activities.length === 0 ? (
                  <p className={styles.empty}>Nenhuma atividade nesta etapa.</p>
                ) : (
                  <div className={styles.activities}>
                    {stage.activities.map((activity) => (
                      <article className={styles.activity} key={activity.id}>
                        <header className={styles.itemHeader}>
                          <div>
                            <h4>{activity.name}</h4>
                            {activity.description && <p>{activity.description}</p>}
                          </div>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.iconAction}
                              aria-label="Mover atividade para cima"
                              onClick={() =>
                                reorder(
                                  moveId(stage.activities.map((item) => item.id), activity.id, -1),
                                  (ids) =>
                                    templatesApi.reorderActivities(templateId, stage.id, { ids }),
                                )
                              }
                            >
                              <CaretUp size={16} />
                            </button>
                            <button
                              type="button"
                              className={styles.iconAction}
                              aria-label="Mover atividade para baixo"
                              onClick={() =>
                                reorder(
                                  moveId(stage.activities.map((item) => item.id), activity.id, 1),
                                  (ids) =>
                                    templatesApi.reorderActivities(templateId, stage.id, { ids }),
                                )
                              }
                            >
                              <CaretDown size={16} />
                            </button>
                            <IconButton
                              action="edit"
                              size="sm"
                              label="Editar atividade"
                              onClick={() =>
                                setDrawer({ kind: "activity", stageId: stage.id, activity })
                              }
                            />
                            <IconButton
                              action="delete"
                              size="sm"
                              label="Excluir atividade"
                              onClick={() =>
                                setPendingDelete({
                                  kind: "activity",
                                  stageId: stage.id,
                                  activity,
                                })
                              }
                            />
                          </div>
                        </header>

                        <div className={styles.requirements}>
                          {activity.requirements.map((requirement) => (
                            <div className={styles.requirement} key={requirement.id}>
                              <div>
                                <strong>
                                  {ActivityRequirementTypeLabel(requirement.type)}
                                  {requirement.isRequired ? " · Obrigatório" : " · Opcional"}
                                </strong>
                                <p>{requirementDetails(requirement)}</p>
                              </div>
                              <div className={styles.actions}>
                                <button
                                  type="button"
                                  className={styles.iconAction}
                                  aria-label="Mover requisito para cima"
                                  onClick={() =>
                                    reorder(
                                      moveId(
                                        activity.requirements.map((item) => item.id),
                                        requirement.id,
                                        -1,
                                      ),
                                      (ids) =>
                                        templatesApi.reorderRequirements(
                                          templateId,
                                          stage.id,
                                          activity.id,
                                          { ids },
                                        ),
                                    )
                                  }
                                >
                                  <CaretUp size={16} />
                                </button>
                                <button
                                  type="button"
                                  className={styles.iconAction}
                                  aria-label="Mover requisito para baixo"
                                  onClick={() =>
                                    reorder(
                                      moveId(
                                        activity.requirements.map((item) => item.id),
                                        requirement.id,
                                        1,
                                      ),
                                      (ids) =>
                                        templatesApi.reorderRequirements(
                                          templateId,
                                          stage.id,
                                          activity.id,
                                          { ids },
                                        ),
                                    )
                                  }
                                >
                                  <CaretDown size={16} />
                                </button>
                                <IconButton
                                  action="edit"
                                  size="sm"
                                  label="Editar requisito"
                                  onClick={() =>
                                    setDrawer({
                                      kind: "requirement",
                                      stageId: stage.id,
                                      activityId: activity.id,
                                      requirement,
                                    })
                                  }
                                />
                                <IconButton
                                  action="delete"
                                  size="sm"
                                  label="Excluir requisito"
                                  onClick={() =>
                                    setPendingDelete({
                                      kind: "requirement",
                                      stageId: stage.id,
                                      activityId: activity.id,
                                      requirement,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            text="Adicionar requisito"
                            onClick={() =>
                              setDrawer({
                                kind: "requirement",
                                stageId: stage.id,
                                activityId: activity.id,
                              })
                            }
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <NamedItemDrawer
        open={drawer?.kind === "stage"}
        title={drawer?.kind === "stage" && drawer.stage ? "Editar etapa" : "Nova etapa"}
        description="Informe o nome e a descrição da etapa."
        nameLabel="Nome da etapa"
        namePlaceholder="Ex.: Infraestrutura"
        submitText="Salvar etapa"
        formId="stage-form"
        defaultValues={
          drawer?.kind === "stage" && drawer.stage
            ? { name: drawer.stage.name, description: drawer.stage.description ?? "" }
            : undefined
        }
        onClose={() => setDrawer(null)}
        onSubmit={(data: NamedItemData) => {
          if (drawer?.kind !== "stage") return undefined;

          if (drawer.stage) {
            return run(
              () => templatesApi.updateStage(templateId, drawer.stage!.id, data),
              "A etapa foi atualizada.",
              "Não foi possível atualizar a etapa.",
            );
          }

          return run(
            () => templatesApi.createStage(templateId, data),
            "A etapa foi cadastrada.",
            "Não foi possível cadastrar a etapa.",
          );
        }}
      />

      <NamedItemDrawer
        open={drawer?.kind === "activity"}
        title={
          drawer?.kind === "activity" && drawer.activity
            ? "Editar atividade"
            : "Nova atividade"
        }
        description="Informe o nome e a descrição da atividade."
        nameLabel="Nome da atividade"
        namePlaceholder="Ex.: Lançamento de cabo"
        submitText="Salvar atividade"
        formId="activity-form"
        defaultValues={
          drawer?.kind === "activity" && drawer.activity
            ? {
                name: drawer.activity.name,
                description: drawer.activity.description ?? "",
              }
            : undefined
        }
        onClose={() => setDrawer(null)}
        onSubmit={(data) => {
          if (drawer?.kind !== "activity") return undefined;

          if (drawer.activity) {
            return run(
              () =>
                templatesApi.updateActivity(
                  templateId,
                  drawer.stageId,
                  drawer.activity!.id,
                  data,
                ),
              "A atividade foi atualizada.",
              "Não foi possível atualizar a atividade.",
            );
          }

          return run(
            () => templatesApi.createActivity(templateId, drawer.stageId, data),
            "A atividade foi cadastrada.",
            "Não foi possível cadastrar a atividade.",
          );
        }}
      />

      <RequirementDrawer
        open={drawer?.kind === "requirement"}
        title={
          drawer?.kind === "requirement" && drawer.requirement
            ? "Editar requisito"
            : "Novo requisito"
        }
        defaultValues={
          drawer?.kind === "requirement" && drawer.requirement
            ? toRequirementForm(drawer.requirement)
            : undefined
        }
        onClose={() => setDrawer(null)}
        onSubmit={(data: RequirementFormData) => {
          if (drawer?.kind !== "requirement") return undefined;

          if (drawer.requirement) {
            return run(
              () =>
                templatesApi.updateRequirement(
                  templateId,
                  drawer.stageId,
                  drawer.activityId,
                  drawer.requirement!.id,
                  data,
                ),
              "O requisito foi atualizado.",
              "Não foi possível atualizar o requisito.",
            );
          }

          return run(
            () =>
              templatesApi.createRequirement(
                templateId,
                drawer.stageId,
                drawer.activityId,
                data,
              ),
            "O requisito foi cadastrado.",
            "Não foi possível cadastrar o requisito.",
          );
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
        onConfirm={confirmDelete}
        onClose={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
}
