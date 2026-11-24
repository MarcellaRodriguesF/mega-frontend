"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";
import FormFieldForm from "../FormFieldForm/FormFieldForm";

import type {
  FormFieldFormData,
  FormFieldFormInput,
} from "../../schemas/form-field-form.schema";

import styles from "@/features/templates/components/NamedItemDrawer/NamedItemDrawer.module.css";

interface FormFieldDrawerProps {
  open: boolean;
  title: string;
  defaultValues?: FormFieldFormInput;
  onClose: () => void;
  onSubmit: (data: FormFieldFormData) => void | Promise<void>;
}

export default function FormFieldDrawer({
  open,
  title,
  defaultValues,
  onClose,
  onSubmit,
}: FormFieldDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: FormFieldFormData) {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      description="Configure o campo que poderá ser reutilizado nas atividades."
      footer={
        <div className={styles.actions}>
          <Button variant="secondary" text="Cancelar" onClick={onClose} disabled={isSubmitting} />
          <Button
            text="Salvar campo"
            type="submit"
            form="form-field-form"
            loading={isSubmitting}
            textLoading="Salvando..."
          />
        </div>
      }
    >
      {open && (
        <FormFieldForm
          formId="form-field-form"
          defaultValues={defaultValues}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}
    </Drawer>
  );
}
