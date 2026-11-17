"use client";

import { Buildings } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import Modal from "@/components/ui/Modal/Modal";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";

import ProviderContactDrawer from "@/features/providers/components/ProviderContactDrawer/ProviderContactDrawer";
import ProviderContacts from "@/features/providers/components/ProviderContacts/ProviderContacts";
import ProviderDocumentDrawer from "@/features/providers/components/ProviderDocumentDrawer/ProviderDocumentDrawer";
import ProviderDocuments from "@/features/providers/components/ProviderDocuments/ProviderDocuments";

import { useProvider } from "@/contexts/ProviderContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";

import {
  ProviderStatusColor,
  ProviderStatusLabel,
} from "@/constants/enums/providers/provider-status.enum";

import { providerContactsApi } from "@/services/api/provider-contacts/provider-contacts.api";
import { providerDocumentsApi } from "@/services/api/provider-documents/provider-documents.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { ProviderContactFormData } from "@/features/providers/schemas/provider-contact.schema";
import type { ProviderDocumentFormData } from "@/features/providers/schemas/provider-document.schema";
import type {
  ProviderContact,
  ProviderDocument,
} from "@/services/api/providers/providers.types";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
}

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

  function sortDocuments(documents: ProviderDocument[]) {
    return [...documents].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  function updateDocumentList(document: ProviderDocument) {
    updateProvider({
      ...provider,
      documents: sortDocuments([
        ...provider.documents.filter((item) => item.id !== document.id),
        document,
      ]),
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

  async function handleCreateDocument(data: ProviderDocumentFormData) {
    try {
      const response = await providerDocumentsApi.create(provider.id, data);

      updateDocumentList(response.data);
      closeDrawer();

      toast.success("O documento foi cadastrado com sucesso.", {
        title: "Documento adicionado!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível cadastrar o documento. Tente novamente.";

      toast.error(message, {
        title: "Erro ao cadastrar documento",
      });

      throw error;
    }
  }

  function handleOpenCreateDocumentDrawer() {
    openDrawer(
      <ProviderDocumentDrawer
        open
        onClose={closeDrawer}
        onSubmit={handleCreateDocument}
        mode="create"
      />,
    );
  }

  async function handleUpdateDocument(
    documentId: string,
    data: ProviderDocumentFormData,
  ) {
    try {
      const response = await providerDocumentsApi.update(
        provider.id,
        documentId,
        data,
      );

      updateDocumentList(response.data);
      closeDrawer();

      toast.success("O documento foi atualizado com sucesso.", {
        title: "Documento atualizado!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar o documento. Tente novamente.";

      toast.error(message, {
        title: "Erro ao atualizar documento",
      });

      throw error;
    }
  }

  function handleOpenEditDocumentDrawer(document: ProviderDocument) {
    openDrawer(
      <ProviderDocumentDrawer
        open
        onClose={closeDrawer}
        onSubmit={(data) => handleUpdateDocument(document.id, data)}
        mode="edit"
        document={document}
      />,
    );
  }

  async function handleDeleteDocument(document: ProviderDocument) {
    try {
      await providerDocumentsApi.delete(provider.id, document.id);

      updateProvider({
        ...provider,
        documents: provider.documents.filter((item) => item.id !== document.id),
      });

      closeDrawer();

      toast.success("O documento foi excluído com sucesso.", {
        title: "Documento excluído!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível excluir o documento. Tente novamente.";

      toast.error(message, {
        title: "Erro ao excluir documento",
      });

      throw error;
    }
  }

  function handleOpenDeleteDocumentModal(document: ProviderDocument) {
    openDrawer(
      <Modal
        open
        variant="danger"
        title="Excluir documento?"
        description={`O documento ${document.name} será excluído permanentemente. Essa ação não poderá ser desfeita.`}
        confirmText="Excluir documento"
        cancelText="Cancelar"
        onConfirm={() => handleDeleteDocument(document)}
        onClose={closeDrawer}
      />,
    );
  }

  return (
    <InfoCardGrid>
      <Card title="Dados cadastrais" icon={<Buildings size={20} />}>
        <InfoField label="Nome" value={provider.name} />

        <InfoField
          label="Status"
          value={
            <StatusBadge
              label={ProviderStatusLabel(provider.status)}
              color={ProviderStatusColor(provider.status)}
            />
          }
        />

        <InfoField label="Observações" value={provider.observations} />

        <InfoField label="Cadastro" value={formatDate(provider.createdAt)} />
      </Card>

      <ProviderContacts
        contacts={provider.contacts}
        onAdd={handleOpenCreateContactDrawer}
        onEdit={handleOpenEditContactDrawer}
        onDelete={handleOpenDeleteContactModal}
      />

      <ProviderDocuments
        documents={provider.documents}
        onAdd={handleOpenCreateDocumentDrawer}
        onEdit={handleOpenEditDocumentDrawer}
        onDelete={handleOpenDeleteDocumentModal}
      />
    </InfoCardGrid>
  );
}
