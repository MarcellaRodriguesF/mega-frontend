"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import ProviderForm from "../ProviderForm/ProviderForm";

import type {
  ProviderEditFormData,
  ProviderFormData,
} from "@/features/providers/schemas/provider-form.schema";
import type { Provider } from "@/services/api/providers/providers.types";

import styles from "./ProviderDrawer.module.css";

interface ProviderCreateDrawerProps {
  open: boolean;
  mode?: "create";
  onClose: () => void;
  onSubmit: (data: ProviderFormData) => void | Promise<void>;
  isLoading?: boolean;
}

interface ProviderEditDrawerProps {
  open: boolean;
  mode: "edit";
  provider: Provider;
  onClose: () => void;
  onSubmit: (data: ProviderEditFormData) => void | Promise<void>;
  isLoading?: boolean;
}

type ProviderDrawerProps = ProviderCreateDrawerProps | ProviderEditDrawerProps;

export default function ProviderDrawer(props: ProviderDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = props.mode === "edit";
  const loading = props.isLoading || isSubmitting;
  const formId = isEditing ? "provider-edit-form" : "provider-form";

  async function handleCreate(data: ProviderFormData) {
    if (props.mode === "edit") return;

    try {
      setIsSubmitting(true);
      await props.onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(data: ProviderEditFormData) {
    if (props.mode !== "edit") return;

    try {
      setIsSubmitting(true);
      await props.onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title={isEditing ? "Editar provedor" : "Novo provedor"}
      description={
        isEditing
          ? "Atualize os dados cadastrais do provedor."
          : "Preencha os dados para cadastrar um novo provedor."
      }
      footer={
        <div className={styles.actions}>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={props.onClose}
            disabled={loading}
          />

          <Button
            text={isEditing ? "Salvar alterações" : "Salvar provedor"}
            type="submit"
            form={formId}
            loading={loading}
          />
        </div>
      }
    >
      {isEditing ? (
        <ProviderForm
          mode="edit"
          formId={formId}
          isLoading={loading}
          initialData={{
            name: props.provider.name,
            phone: props.provider.phone ?? "",
            observations: props.provider.observations ?? "",
            status: props.provider.status,
          }}
          onSubmit={handleEdit}
        />
      ) : (
        <ProviderForm
          formId={formId}
          isLoading={loading}
          onSubmit={handleCreate}
        />
      )}
    </Drawer>
  );
}
