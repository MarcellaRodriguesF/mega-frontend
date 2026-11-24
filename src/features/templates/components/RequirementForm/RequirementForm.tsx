"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import FormMessage from "@/components/ui/FormMessage/FormMessage";

import { formTemplatesApi } from "@/services/api/form-templates/form-templates.api";
import { FormTemplateStatus } from "@/constants/enums/templates/form-template-status.enum";
import {
  ACTIVITY_REQUIREMENT_TYPE_OPTIONS,
  ActivityRequirementType,
} from "@/constants/enums/templates/activity-requirement-type.enum";
import {
  EvidenceTypeLabel,
  SUGGESTED_EVIDENCE_TYPES,
} from "@/constants/enums/templates/evidence-type";

import {
  requirementFormDefaultValues,
  requirementFormSchema,
  type RequirementFormData,
  type RequirementFormInput,
} from "../../schemas/requirement-form.schema";

import styles from "./RequirementForm.module.css";

interface RequirementFormProps {
  formId: string;
  defaultValues?: RequirementFormInput;
  isLoading?: boolean;
  onSubmit: (data: RequirementFormData) => void | Promise<void>;
}

export default function RequirementForm({
  formId,
  defaultValues,
  isLoading = false,
  onSubmit,
}: RequirementFormProps) {
  const [customType, setCustomType] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequirementFormInput, unknown, RequirementFormData>({
    resolver: zodResolver(requirementFormSchema),
    defaultValues: defaultValues ?? requirementFormDefaultValues,
  });

  const type = watch("type");
  const evidenceTypes = watch("evidenceTypes") ?? [];

  const formsQuery = useQuery({
    queryKey: ["form-templates", "active"],
    queryFn: () => formTemplatesApi.findAll(FormTemplateStatus.ACTIVE),
    enabled: type === ActivityRequirementType.FORM,
  });

  function toggleEvidenceType(value: string) {
    const current = new Set(evidenceTypes);

    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }

    setValue("evidenceTypes", [...current], { shouldValidate: true });
  }

  function addCustomType() {
    const normalized = customType.trim().toUpperCase();

    if (!normalized || evidenceTypes.includes(normalized)) {
      setCustomType("");
      return;
    }

    setValue("evidenceTypes", [...evidenceTypes, normalized], {
      shouldValidate: true,
    });
    setCustomType("");
  }

  const knownTypes = new Set<string>(SUGGESTED_EVIDENCE_TYPES);
  const extraTypes = evidenceTypes.filter((item) => !knownTypes.has(item));

  return (
    <form id={formId} className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Select
        label="Tipo de requisito"
        required
        disabled={isLoading}
        options={ACTIVITY_REQUIREMENT_TYPE_OPTIONS}
        error={errors.type?.message}
        {...register("type")}
      />

      <label className={styles.check}>
        <input type="checkbox" disabled={isLoading} {...register("isRequired")} />
        Obrigatório para concluir a atividade
      </label>

      {type === ActivityRequirementType.EVIDENCE && (
        <fieldset className={styles.fieldset}>
          <legend>Tipos de arquivo aceitos</legend>
          <p className={styles.help}>
            Quando o requisito for obrigatório, basta uma evidência de qualquer tipo selecionado.
          </p>
          {SUGGESTED_EVIDENCE_TYPES.map((item) => (
            <label className={styles.check} key={item}>
              <input
                type="checkbox"
                checked={evidenceTypes.includes(item)}
                disabled={isLoading}
                onChange={() => toggleEvidenceType(item)}
              />
              {EvidenceTypeLabel(item)}
            </label>
          ))}
          {extraTypes.map((item) => (
            <label className={styles.check} key={item}>
              <input
                type="checkbox"
                checked
                disabled={isLoading}
                onChange={() => toggleEvidenceType(item)}
              />
              {item}
            </label>
          ))}
          <div className={styles.customType}>
            <Input
              label="Outro tipo"
              placeholder="Ex.: VIDEO"
              value={customType}
              disabled={isLoading}
              onChange={(event) => setCustomType(event.target.value)}
            />
            <button type="button" className={styles.addType} onClick={addCustomType}>
              Adicionar
            </button>
          </div>
          <FormMessage message={errors.evidenceTypes?.message ?? ""} />
        </fieldset>
      )}

      {type === ActivityRequirementType.FORM && (
        <Select
          label="Formulário"
          required
          disabled={isLoading || formsQuery.isLoading}
          placeholder={
            formsQuery.isLoading ? "Carregando formulários..." : "Selecione um formulário"
          }
          options={(formsQuery.data?.data ?? []).map((form) => ({
            value: form.id,
            label: form.name,
          }))}
          error={errors.formTemplateId?.message}
          {...register("formTemplateId")}
        />
      )}

      {type === ActivityRequirementType.QUANTITY && (
        <>
          <Input
            label="Unidade de medida"
            placeholder="Ex.: km, un, m"
            disabled={isLoading}
            error={errors.unit?.message}
            {...register("unit")}
          />
          <Input
            label="Quantidade planejada"
            type="number"
            min={0}
            step="any"
            disabled={isLoading}
            error={errors.plannedQuantity?.message}
            {...register("plannedQuantity")}
          />
        </>
      )}

      {type === ActivityRequirementType.COMPLETION_PERCENTAGE && (
        <Input
          label="Percentual mínimo"
          type="number"
          min={0}
          max={100}
          step="any"
          required
          disabled={isLoading}
          error={errors.minimumPercentage?.message}
          {...register("minimumPercentage")}
        />
      )}

      {type === ActivityRequirementType.COMMENT && (
        <p className={styles.help}>Exige um comentário de execução. O preenchimento não faz parte desta fase.</p>
      )}
      {type === ActivityRequirementType.ENGINEER_APPROVAL && (
        <p className={styles.help}>
          Identifica a necessidade de aprovação por engenheiro. O fluxo de aprovação não faz parte desta fase.
        </p>
      )}
      {type === ActivityRequirementType.DAILY_REPORT && (
        <p className={styles.help}>
          Exige registro no diário de obra. O diário de obra não faz parte desta fase.
        </p>
      )}
    </form>
  );
}
