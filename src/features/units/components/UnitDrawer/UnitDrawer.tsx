"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import UnitForm from "../UnitForm/UnitForm";

import type { Unit } from "@/services/api/units/units.types";
import type { UnitFormData } from "@/features/units/schemas/unit-form.schema";

import styles from "./UnitDrawer.module.css";

interface UnitDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UnitFormData) => void | Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialData?: Unit;
}

export default function UnitDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  mode = "create",
  initialData,
}: UnitDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = isLoading || isSubmitting;
  const isEditing = mode === "edit";

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
      title={isEditing ? "Editar unidade" : "Nova unidade"}
      description={
        isEditing
          ? "Atualize os dados cadastrais da unidade."
          : "Preencha os dados para cadastrar uma nova unidade."
      }
      footer={
        <div className={styles.actions}>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={onClose}
            disabled={loading}
          />

          <Button
            text={isEditing ? "Salvar alterações" : "Salvar unidade"}
            type="submit"
            form="unit-form"
            loading={loading}
          />
        </div>
      }
    >
      <UnitForm
        onSubmit={handleSubmit}
        isLoading={loading}
        initialData={initialData}
      />
    </Drawer>
  );
}
