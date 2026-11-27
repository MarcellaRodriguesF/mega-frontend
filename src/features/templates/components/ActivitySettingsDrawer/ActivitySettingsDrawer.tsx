"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";

import { ActivityRequirementTypeLabel } from "@/constants/enums/templates/activity-requirement-type.enum";
import type { ActivityRequirement } from "@/services/api/templates/templates.types";
import type { RequirementFormData, RequirementFormInput } from "../../schemas/requirement-form.schema";
import { moveId } from "../../template-utils";

import RequirementForm from "../RequirementForm/RequirementForm";

import styles from "./ActivitySettingsDrawer.module.css";

interface ActivitySettingsDrawerProps {
  open: boolean;
  activityId: string | null;
  activityName: string;
  activityDescription: string | null;
  requirements: ActivityRequirement[];
  onClose: () => void;
  onApply: (data: { name: string; description: string | null }) => void;
  onSaveRequirement: (
    requirement: ActivityRequirement | null,
    data: RequirementFormData,
  ) => Promise<boolean>;
  onDeleteRequirement: (requirement: ActivityRequirement) => void;
  onReorderRequirements: (ids: string[]) => Promise<void>;
}

function toRequirementForm(requirement: ActivityRequirement): RequirementFormInput {
  const quantity =
    requirement.type === "QUANTITY" &&
    requirement.configuration &&
    typeof requirement.configuration === "object" &&
    "unit" in requirement.configuration
      ? requirement.configuration
      : null;
  const completion =
    requirement.type === "COMPLETION_PERCENTAGE" &&
    requirement.configuration &&
    typeof requirement.configuration === "object" &&
    "minimumPercentage" in requirement.configuration
      ? requirement.configuration
      : null;

  return {
    type: requirement.type,
    isRequired: requirement.isRequired,
    evidenceTypes: requirement.evidenceTypes.map((item) => item.type),
    formTemplateId: requirement.formTemplateId ?? "",
    unit: quantity && "unit" in quantity ? String(quantity.unit ?? "") : "",
    plannedQuantity:
      quantity && "plannedQuantity" in quantity && quantity.plannedQuantity != null
        ? String(quantity.plannedQuantity)
        : "",
    minimumPercentage:
      completion && "minimumPercentage" in completion
        ? String(completion.minimumPercentage ?? "")
        : "",
  };
}

export default function ActivitySettingsDrawer(props: ActivitySettingsDrawerProps) {
  if (!props.open || !props.activityId) {
    return (
      <Drawer
        open={false}
        onClose={props.onClose}
        title="Configurações da atividade"
        description="Ajuste nome, descrição e requisitos. O nome entra nas alterações pendentes do editor."
      >
        {null}
      </Drawer>
    );
  }

  return <ActivitySettingsDrawerOpen key={props.activityId} {...props} activityId={props.activityId} />;
}

function ActivitySettingsDrawerOpen({
  open,
  activityName,
  activityDescription,
  requirements,
  onClose,
  onApply,
  onSaveRequirement,
  onDeleteRequirement,
  onReorderRequirements,
}: ActivitySettingsDrawerProps & { activityId: string }) {
  const [name, setName] = useState(activityName);
  const [description, setDescription] = useState(activityDescription ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [requirementEdit, setRequirementEdit] = useState<
    ActivityRequirement | "new" | null
  >(null);
  const [isSavingRequirement, setIsSavingRequirement] = useState(false);

  function applyDetails() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("O nome da atividade é obrigatório.");
      return;
    }

    onApply({
      name: trimmedName,
      description: description.trim() || null,
    });
    onClose();
  }

  async function handleRequirement(data: RequirementFormData) {
    try {
      setIsSavingRequirement(true);
      const saved = await onSaveRequirement(
        requirementEdit === "new" ? null : requirementEdit,
        data,
      );
      if (saved) setRequirementEdit(null);
    } finally {
      setIsSavingRequirement(false);
    }
  }

  const editingRequirement =
    requirementEdit && requirementEdit !== "new" ? requirementEdit : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Configurações da atividade"
      description="Ajuste nome, descrição e requisitos. O nome entra nas alterações pendentes do editor."
      footer={
        requirementEdit ? (
          <div className={styles.actions}>
            <Button
              variant="secondary"
              text="Voltar"
              onClick={() => setRequirementEdit(null)}
              disabled={isSavingRequirement}
            />
            <Button
              text="Salvar requisito"
              type="submit"
              form="activity-requirement-form"
              loading={isSavingRequirement}
              textLoading="Salvando..."
            />
          </div>
        ) : (
          <div className={styles.actions}>
            <Button variant="secondary" text="Fechar" onClick={onClose} />
            <Button text="Aplicar no editor" onClick={applyDetails} />
          </div>
        )
      }
    >
      {requirementEdit ? (
        <RequirementForm
          formId="activity-requirement-form"
          defaultValues={
            editingRequirement ? toRequirementForm(editingRequirement) : undefined
          }
          isLoading={isSavingRequirement}
          onSubmit={handleRequirement}
        />
      ) : (
        <div className={styles.content}>
          <Input
            label="Nome da atividade"
            required
            maxLength={255}
            value={name}
            error={nameError ?? undefined}
            onChange={(event) => {
              setName(event.target.value);
              if (nameError) setNameError(null);
            }}
          />
          <Textarea
            label="Descrição"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className={styles.requirementsHeader}>
            <h3>Requisitos de conclusão</h3>
            <Button
              variant="outline"
              text="Adicionar requisito"
              onClick={() => setRequirementEdit("new")}
            />
          </div>

          {requirements.length === 0 ? (
            <p className={styles.empty}>Nenhum requisito configurado.</p>
          ) : (
            <ul className={styles.requirements}>
              {requirements.map((requirement) => (
                <li key={requirement.id}>
                  <div>
                    <strong>
                      {ActivityRequirementTypeLabel(requirement.type)}
                      {requirement.isRequired ? " · Obrigatório" : " · Opcional"}
                    </strong>
                  </div>
                  <div className={styles.requirementActions}>
                    <button
                      type="button"
                      className={styles.orderButton}
                      aria-label="Mover requisito para cima"
                      onClick={() => {
                        const ids = moveId(
                          requirements.map((item) => item.id),
                          requirement.id,
                          -1,
                        );
                        if (ids) void onReorderRequirements(ids);
                      }}
                    >
                      Subir
                    </button>
                    <button
                      type="button"
                      className={styles.orderButton}
                      aria-label="Mover requisito para baixo"
                      onClick={() => {
                        const ids = moveId(
                          requirements.map((item) => item.id),
                          requirement.id,
                          1,
                        );
                        if (ids) void onReorderRequirements(ids);
                      }}
                    >
                      Descer
                    </button>
                    <IconButton
                      action="edit"
                      size="sm"
                      label="Editar requisito"
                      onClick={() => setRequirementEdit(requirement)}
                    />
                    <IconButton
                      action="delete"
                      size="sm"
                      label="Excluir requisito"
                      onClick={() => onDeleteRequirement(requirement)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Drawer>
  );
}
