"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import UnitForm from "../UnitForm/UnitForm";

import type { UnitFormData } from "@/features/units/schemas/unit-form.schema";

import styles from "./UnitDrawer.module.css";

interface UnitDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UnitFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export default function UnitDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: UnitDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = isLoading || isSubmitting;

  async function handleSubmit(data: UnitFormData) {
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
      title="Nova usina"
      description="Preencha os dados para cadastrar uma nova usina."
      footer={
        <div className={styles.actions}>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={onClose}
            disabled={loading}
          />

          <Button
            text="Salvar usina"
            type="submit"
            form="unit-form"
            loading={loading}
          />
        </div>
      }
    >
      <UnitForm onSubmit={handleSubmit} isLoading={loading} />
    </Drawer>
  );
}
