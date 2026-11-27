import { z } from "zod";

import { ActivityRequirementType } from "@/constants/enums/templates/activity-requirement-type.enum";

export const requirementFormSchema = z
  .object({
    type: z.enum(ActivityRequirementType),
    isRequired: z.boolean(),
    evidenceTypes: z.array(z.string().trim().min(1)).default([]),
    formTemplateId: z.string(),
    unit: z.string().trim().max(50, "A unidade deve ter no máximo 50 caracteres."),
    plannedQuantity: z.string().trim(),
    minimumPercentage: z.string().trim(),
  })
  .superRefine((data, context) => {
    if (data.type === ActivityRequirementType.EVIDENCE && data.isRequired) {
      if (data.evidenceTypes.length === 0) {
        context.addIssue({
          code: "custom",
          message: "Informe pelo menos um tipo de evidência.",
          path: ["evidenceTypes"],
        });
      }
    }

    if (data.type === ActivityRequirementType.FORM && !data.formTemplateId) {
      context.addIssue({
        code: "custom",
        message: "Selecione um formulário ativo.",
        path: ["formTemplateId"],
      });
    }

    if (data.type === ActivityRequirementType.QUANTITY && data.isRequired) {
      if (!data.unit) {
        context.addIssue({
          code: "custom",
          message: "Informe a unidade de medida.",
          path: ["unit"],
        });
      }

      const quantity = Number(data.plannedQuantity);

      if (!data.plannedQuantity || !Number.isFinite(quantity) || quantity <= 0) {
        context.addIssue({
          code: "custom",
          message: "Informe uma quantidade planejada maior que zero.",
          path: ["plannedQuantity"],
        });
      }
    }

    if (data.type === ActivityRequirementType.COMPLETION_PERCENTAGE) {
      const percentage = Number(data.minimumPercentage);

      if (
        data.minimumPercentage === "" ||
        !Number.isFinite(percentage) ||
        percentage < 0 ||
        percentage > 100
      ) {
        context.addIssue({
          code: "custom",
          message: "O percentual mínimo deve estar entre 0 e 100.",
          path: ["minimumPercentage"],
        });
      }
    }
  })
  .transform((data) => {
    const plannedQuantity =
      data.plannedQuantity === "" ? null : Number(data.plannedQuantity);

    return {
      type: data.type,
      isRequired: data.isRequired,
      evidenceTypes:
        data.type === ActivityRequirementType.EVIDENCE ? data.evidenceTypes : [],
      formTemplateId:
        data.type === ActivityRequirementType.FORM ? data.formTemplateId : null,
      configuration:
        data.type === ActivityRequirementType.QUANTITY
          ? {
              unit: data.unit || null,
              plannedQuantity,
            }
          : data.type === ActivityRequirementType.COMPLETION_PERCENTAGE
            ? { minimumPercentage: Number(data.minimumPercentage) }
            : null,
    };
  });

export type RequirementFormInput = z.input<typeof requirementFormSchema>;
export type RequirementFormData = z.output<typeof requirementFormSchema>;

export const requirementFormDefaultValues: RequirementFormInput = {
  type: ActivityRequirementType.EVIDENCE,
  isRequired: true,
  evidenceTypes: [],
  formTemplateId: "",
  unit: "",
  plannedQuantity: "",
  minimumPercentage: "",
};
