"use client";

import { useState } from "react";
// import styles from "./ContactDrawer.module.css";
import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";
import { Contact } from "@/services/api/contacts/contacts.types";
import ContactForm from "../ContactForm/ContactForm";
import {
  ContactFormData,
  ContactFormInput,
} from "@/features/companies/schemas/contacts.schema";

interface ContactDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => void | Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  contact?: Contact;
}

export default function ContactDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  mode = "create",
  contact,
}: ContactDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === "edit";
  const loading = isLoading || isSubmitting;

  const initialData: ContactFormInput | undefined = contact
    ? {
        name: contact.name,
        role: contact.role ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        whatsapp: contact.whatsapp ?? "",
        isPrimary: contact.isPrimary,
      }
    : undefined;

  async function handleSubmit(data: ContactFormData) {
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
          : "Preencha os dados para adicionar um novo contato à empresa."
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
            form="contact-form"
            text={isEditing ? "Salvar alterações" : "Salvar contato"}
            loading={loading}
          />
        </>
      }
    >
      <ContactForm
        onSubmit={handleSubmit}
        isLoading={loading}
        initialData={initialData}
      />
    </Drawer>
  );
}
