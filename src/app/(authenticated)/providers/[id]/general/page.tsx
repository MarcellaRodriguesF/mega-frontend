"use client";

import { Buildings } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import Modal from "@/components/ui/Modal/Modal";
import ProviderContactDrawer from "@/features/providers/components/ProviderContactDrawer/ProviderContactDrawer";
import ProviderContacts from "@/features/providers/components/ProviderContacts/ProviderContacts";
import { useProvider } from "@/contexts/ProviderContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";

import { providerContactsApi } from "@/services/api/provider-contacts/provider-contacts.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { ProviderContactFormData } from "@/features/providers/schemas/provider-contact.schema";
import type { ProviderContact } from "@/services/api/providers/providers.types";
import ContactActions from "@/components/ui/ContactActions/ContactActions";

export default function ProviderGeneralPage() {
  const { provider, updateProvider } = useProvider();
  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();

  function sortContacts(contacts: ProviderContact[]) {
    return [...contacts].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }

      return a.name.localeCompare(b.name, "pt-BR");
    });
  }

  function updateContactList(contact: ProviderContact) {
    const contacts = provider.contacts
      .filter((item) => item.id !== contact.id)
      .map((item) =>
        contact.isPrimary ? { ...item, isPrimary: false } : item,
      );

    updateProvider({
      ...provider,
      contacts: sortContacts([...contacts, contact]),
    });
  }

  async function handleCreateContact(data: ProviderContactFormData) {
    try {
      const response = await providerContactsApi.create(provider.id, data);

      updateContactList(response.data);
      closeDrawer();

      toast.success("O contato foi cadastrado com sucesso.", {
        title: "Contato adicionado!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível cadastrar o contato. Tente novamente.";

      toast.error(message, {
        title: "Erro ao cadastrar contato",
      });

      throw error;
    }
  }

  function handleOpenCreateContactDrawer() {
    openDrawer(
      <ProviderContactDrawer
        open
        onClose={closeDrawer}
        onSubmit={handleCreateContact}
        mode="create"
      />,
    );
  }

  async function handleUpdateContact(
    contactId: string,
    data: ProviderContactFormData,
  ) {
    try {
      const response = await providerContactsApi.update(
        provider.id,
        contactId,
        data,
      );

      updateContactList(response.data);
      closeDrawer();

      toast.success("O contato foi atualizado com sucesso.", {
        title: "Contato atualizado!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar o contato. Tente novamente.";

      toast.error(message, {
        title: "Erro ao atualizar contato",
      });

      throw error;
    }
  }

  function handleOpenEditContactDrawer(contact: ProviderContact) {
    openDrawer(
      <ProviderContactDrawer
        open
        onClose={closeDrawer}
        onSubmit={(data) => handleUpdateContact(contact.id, data)}
        mode="edit"
        contact={contact}
      />,
    );
  }

  async function handleDeleteContact(contact: ProviderContact) {
    try {
      await providerContactsApi.delete(provider.id, contact.id);

      updateProvider({
        ...provider,
        contacts: provider.contacts.filter((item) => item.id !== contact.id),
      });

      closeDrawer();

      toast.success("O contato foi excluído com sucesso.", {
        title: "Contato excluído!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível excluir o contato. Tente novamente.";

      toast.error(message, {
        title: "Erro ao excluir contato",
      });

      throw error;
    }
  }

  function handleOpenDeleteContactModal(contact: ProviderContact) {
    openDrawer(
      <Modal
        open
        variant="danger"
        title="Excluir contato?"
        description={`O contato ${contact.name} será excluído permanentemente. Essa ação não poderá ser desfeita.`}
        confirmText="Excluir contato"
        cancelText="Cancelar"
        onConfirm={() => handleDeleteContact(contact)}
        onClose={closeDrawer}
      />,
    );
  }

  return (
    <InfoCardGrid>
      <Card title="Dados cadastrais" icon={<Buildings size={20} />}>
        <InfoField label="Nome" value={provider.name} />
        <InfoField label="Observações" value={provider.observations} />{" "}
        <ContactActions phone={provider.phone} label="Telefone" />
      </Card>

      <ProviderContacts
        contacts={provider.contacts}
        onAdd={handleOpenCreateContactDrawer}
        onEdit={handleOpenEditContactDrawer}
        onDelete={handleOpenDeleteContactModal}
      />
    </InfoCardGrid>
  );
}
