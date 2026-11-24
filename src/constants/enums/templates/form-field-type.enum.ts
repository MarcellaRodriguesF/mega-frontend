export enum FormFieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  DATE = "DATE",
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTIPLE_SELECT = "MULTIPLE_SELECT",
  CHECKBOX = "CHECKBOX",
  FILE = "FILE",
}

export const FormFieldTypeLabel = (value?: FormFieldType | string): string => {
  const map: Record<FormFieldType, string> = {
    [FormFieldType.TEXT]: "Texto",
    [FormFieldType.TEXTAREA]: "Texto longo",
    [FormFieldType.NUMBER]: "Número",
    [FormFieldType.DATE]: "Data",
    [FormFieldType.SINGLE_SELECT]: "Seleção única",
    [FormFieldType.MULTIPLE_SELECT]: "Seleção múltipla",
    [FormFieldType.CHECKBOX]: "Caixa de seleção",
    [FormFieldType.FILE]: "Arquivo",
  };

  if (!value || !(value in map)) return "Não identificado";

  return map[value as FormFieldType];
};

export const FORM_FIELD_TYPE_OPTIONS = Object.values(FormFieldType).map(
  (value) => ({
    value,
    label: FormFieldTypeLabel(value),
  }),
);

export function fieldTypeUsesOptions(type: string) {
  return type === FormFieldType.SINGLE_SELECT || type === FormFieldType.MULTIPLE_SELECT;
}
