"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import Textarea from "@/components/ui/Textarea/Textarea";
import FormMessage from "@/components/ui/FormMessage/FormMessage";

import {
  fieldTypeUsesOptions,
  FORM_FIELD_TYPE_OPTIONS,
  FormFieldType,
} from "@/constants/enums/templates/form-field-type.enum";

import {
  formFieldFormSchema,
  type FormFieldFormData,
  type FormFieldFormInput,
} from "../../schemas/form-field-form.schema";

import styles from "./FormFieldForm.module.css";

interface FormFieldFormProps {
  formId: string;
  defaultValues?: FormFieldFormInput;
  isLoading?: boolean;
  onSubmit: (data: FormFieldFormData) => void | Promise<void>;
}

const emptyValues: FormFieldFormInput = {
  key: "",
  label: "",
  description: "",
  type: FormFieldType.TEXT,
  placeholder: "",
  isRequired: false,
  options: [],
};

export default function FormFieldForm({
  formId,
  defaultValues,
  isLoading = false,
  onSubmit,
}: FormFieldFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFieldFormInput, unknown, FormFieldFormData>({
    resolver: zodResolver(formFieldFormSchema),
    defaultValues: defaultValues ?? emptyValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const type = useWatch({ control, name: "type" });
  const showOptions = fieldTypeUsesOptions(type);
  const showPlaceholder = ![FormFieldType.CHECKBOX, FormFieldType.FILE].includes(type);

  return (
    <form id={formId} className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Rótulo"
        placeholder="Ex.: Tipo do cabo"
        required
        disabled={isLoading}
        error={errors.label?.message}
        {...register("label")}
      />
      <Select
        label="Tipo"
        required
        disabled={isLoading}
        options={FORM_FIELD_TYPE_OPTIONS}
        error={errors.type?.message}
        {...register("type")}
      />
      <Input
        label="Chave técnica"
        placeholder="Ex.: tipo_cabo"
        helperText="Identificador usado pelo sistema para reconhecer este campo."
        required
        disabled={isLoading}
        error={errors.key?.message}
        {...register("key")}
      />
      <Textarea label="Descrição" disabled={isLoading} error={errors.description?.message} {...register("description")} />
      {showPlaceholder ? <Input label="Texto de orientação" disabled={isLoading} error={errors.placeholder?.message} {...register("placeholder")} /> : null}
      <label className={styles.check}>
        <input type="checkbox" disabled={isLoading} {...register("isRequired")} />
        Campo obrigatório
      </label>

      {showOptions && (
        <div className={styles.options}>
          <div className={styles.optionsHeader}>
            <strong>Opções</strong>
            <Button
              variant="outline"
              text="Adicionar opção"
              onClick={() => append({ value: "", label: "" })}
            />
          </div>
          {fields.map((field, index) => (
            <div className={styles.option} key={field.id}>
              <Input
                label="Valor"
                disabled={isLoading}
                error={errors.options?.[index]?.value?.message}
                {...register(`options.${index}.value`)}
              />
              <Input
                label="Rótulo"
                disabled={isLoading}
                error={errors.options?.[index]?.label?.message}
                {...register(`options.${index}.label`)}
              />
              <Button variant="secondary" text="Remover" onClick={() => remove(index)} />
            </div>
          ))}
          <FormMessage message={errors.options?.message ?? ""} />
        </div>
      )}
    </form>
  );
}
