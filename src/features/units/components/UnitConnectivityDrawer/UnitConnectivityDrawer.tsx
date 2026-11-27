"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import UnitConnectivityForm from "../UnitConnectivityForm/UnitConnectivityForm";

import type { UnitConnectivity } from "@/services/api/unit-connectivities/unit-connectivities.types";
import type { UnitConnectivityFormData } from "@/features/units/schemas/unit-connectivity-form.schema";

interface CreateProps {
  open: boolean;
  mode?: "create";
  onClose: () => void;
  onSubmit: (data: UnitConnectivityFormData) => void | Promise<void>;
}

interface EditProps {
  open: boolean;
  mode: "edit";
  connectivity: UnitConnectivity;
  onClose: () => void;
  onSubmit: (data: UnitConnectivityFormData) => void | Promise<void>;
}

type UnitConnectivityDrawerProps = CreateProps | EditProps;

export default function UnitConnectivityDrawer(
  props: UnitConnectivityDrawerProps,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const isEditing = props.mode === "edit";

  const formId = isEditing
    ? "unit-connectivity-edit-form"
    : "unit-connectivity-create-form";

  async function handleSubmit(data: UnitConnectivityFormData) {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await props.onSubmit(data);
    } catch (error) {
      setSubmitError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title={isEditing ? "Editar conectividade" : "Nova conectividade"}
      description={
        isEditing
          ? "Atualize as informações da conexão da unidade."
          : "Informe os dados da conexão de internet da unidade."
      }
      footer={
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={props.onClose}
            disabled={isSubmitting}
          />

          <Button
            text={isEditing ? "Salvar alterações" : "Cadastrar conexão"}
            type="submit"
            form={formId}
            loading={isSubmitting}
          />
        </div>
      }
    >
      <UnitConnectivityForm
        formId={formId}
        initialData={isEditing ? props.connectivity : undefined}
        isLoading={isSubmitting}
        submitError={submitError}
        onSubmit={handleSubmit}
      />
    </Drawer>
  );
}
