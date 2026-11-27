"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";
import type { SelectOption } from "@/components/ui/Select/Select";

import ProviderDocumentForm from "../ProviderDocumentForm/ProviderDocumentForm";

import type {
  ProviderDocumentFormData,
  ProviderDocumentFormInput,
} from "@/features/providers/schemas/provider-document.schema";
interface DocumentFormRecord {
  id: string;
  name: string;
  type: string | null;
  unitId?: string | null;
  fileName: string;
  observations: string | null;
}

interface ProviderDocumentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProviderDocumentFormData) => void | Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  document?: DocumentFormRecord;
  unitOptions?: SelectOption[];
  entityLabel?: "provedor" | "empresa";
}

export default function ProviderDocumentDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  mode = "create",
  document,
  unitOptions,
  entityLabel = "provedor",
}: ProviderDocumentDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === "edit";
  const loading = isLoading || isSubmitting;

  const initialData: ProviderDocumentFormInput | undefined = document
    ? {
        name: document.name,
        type: document.type ?? "",
        unitId: document.unitId ?? "__no_unit__",
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
          : `Preencha os dados para adicionar um documento ${entityLabel === "empresa" ? "à empresa" : "ao provedor"}.`
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
        unitOptions={unitOptions}
      />
    </Drawer>
  );
}
