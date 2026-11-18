"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import ProviderDocumentForm from "../ProviderDocumentForm/ProviderDocumentForm";

import type {
  ProviderDocumentFormData,
  ProviderDocumentFormInput,
} from "@/features/providers/schemas/provider-document.schema";
import type { ProviderDocument } from "@/services/api/providers/providers.types";

interface ProviderDocumentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProviderDocumentFormData) => void | Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  document?: ProviderDocument;
}

export default function ProviderDocumentDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  mode = "create",
  document,
}: ProviderDocumentDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === "edit";
  const loading = isLoading || isSubmitting;

  const initialData: ProviderDocumentFormInput | undefined = document
    ? {
        name: document.name,
        file: null,
        observations: document.observations ?? "",
      }
    : undefined;

  async function handleSubmit(data: ProviderDocumentFormData) {
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
      title={isEditing ? "Editar documento" : "Adicionar documento"}
      description={
        isEditing
          ? "Atualize os dados deste documento."
          : "Preencha os dados para adicionar um documento ao provedor."
      }
      footer={
        <>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={onClose}
            disabled={loading}
          />

          <Button
            type="submit"
            form="provider-document-form"
            text={isEditing ? "Salvar alterações" : "Salvar documento"}
            loading={loading}
          />
        </>
      }
    >
      <ProviderDocumentForm
        key={document?.id ?? "new-provider-document"}
        onSubmit={handleSubmit}
        isLoading={loading}
        initialData={initialData}
        requireFile={!isEditing}
        currentFileName={document?.fileName}
      />
    </Drawer>
  );
}
