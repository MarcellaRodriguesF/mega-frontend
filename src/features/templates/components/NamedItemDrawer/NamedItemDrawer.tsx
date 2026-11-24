"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";
import NamedItemForm from "../NamedItemForm/NamedItemForm";

import type { NamedItemData, NamedItemInput } from "../../schemas/named-item.schema";

import styles from "./NamedItemDrawer.module.css";

interface NamedItemDrawerProps {
  open: boolean;
  title: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  submitText: string;
  formId: string;
  defaultValues?: NamedItemInput;
  onClose: () => void;
  onSubmit: (data: NamedItemData) => void | Promise<void>;
}

export default function NamedItemDrawer({
  open,
  title,
  description,
  nameLabel,
  namePlaceholder,
  submitText,
  formId,
  defaultValues,
  onClose,
  onSubmit,
}: NamedItemDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: NamedItemData) {
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
      description={description}
      footer={
        <div className={styles.actions}>
          <Button variant="secondary" text="Cancelar" onClick={onClose} disabled={isSubmitting} />
          <Button
            text={submitText}
            type="submit"
            form={formId}
            loading={isSubmitting}
            textLoading="Salvando..."
          />
        </div>
      }
    >
      {open && (
        <NamedItemForm
          formId={formId}
          nameLabel={nameLabel}
          namePlaceholder={namePlaceholder}
          defaultValues={defaultValues}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}
    </Drawer>
  );
}
