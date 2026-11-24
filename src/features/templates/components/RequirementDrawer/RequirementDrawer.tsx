"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";
import RequirementForm from "../RequirementForm/RequirementForm";

import type {
  RequirementFormData,
  RequirementFormInput,
} from "../../schemas/requirement-form.schema";

import styles from "../NamedItemDrawer/NamedItemDrawer.module.css";

interface RequirementDrawerProps {
  open: boolean;
  title: string;
  defaultValues?: RequirementFormInput;
  onClose: () => void;
  onSubmit: (data: RequirementFormData) => void | Promise<void>;
}

export default function RequirementDrawer({
  open,
  title,
  defaultValues,
  onClose,
  onSubmit,
}: RequirementDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formId = "requirement-form";

  async function handleSubmit(data: RequirementFormData) {
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
      description="Defina o que precisa ser atendido para concluir a atividade."
      footer={
        <div className={styles.actions}>
          <Button variant="secondary" text="Cancelar" onClick={onClose} disabled={isSubmitting} />
          <Button
            text="Salvar requisito"
            type="submit"
            form={formId}
            loading={isSubmitting}
            textLoading="Salvando..."
          />
        </div>
      }
    >
      {open && (
        <RequirementForm
          formId={formId}
          defaultValues={defaultValues}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}
    </Drawer>
  );
}
