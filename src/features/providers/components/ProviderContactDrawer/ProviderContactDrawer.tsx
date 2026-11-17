"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import ProviderContactForm from "../ProviderContactForm/ProviderContactForm";

import type {
  ProviderContactFormData,
  ProviderContactFormInput,
} from "@/features/providers/schemas/provider-contact.schema";
import type { ProviderContact } from "@/services/api/providers/providers.types";

interface ProviderContactDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProviderContactFormData) => void | Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  contact?: ProviderContact;
}

export default function ProviderContactDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  mode = "create",
  contact,
}: ProviderContactDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === "edit";
  const loading = isLoading || isSubmitting;

  const initialData: ProviderContactFormInput | undefined = contact
    ? {
        name: contact.name,
        role: contact.role ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        whatsapp: contact.whatsapp ?? "",
        isPrimary: contact.isPrimary,
      }
    : undefined;

  async function handleSubmit(data: ProviderContactFormData) {
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
      title={isEditing ? "Editar contato" : "Adicionar contato"}
      description={
        isEditing
          ? "Atualize as informações deste contato."
          : "Preencha os dados para adicionar um novo contato ao provedor."
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
            form="provider-contact-form"
            text={isEditing ? "Salvar alterações" : "Salvar contato"}
            loading={loading}
          />
        </>
      }
    >
      <ProviderContactForm
        onSubmit={handleSubmit}
        isLoading={loading}
        initialData={initialData}
      />
    </Drawer>
  );
}
