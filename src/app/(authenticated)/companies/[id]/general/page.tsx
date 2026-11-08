"use client";

import { Buildings, MapPin, FileText, PhoneIcon } from "@phosphor-icons/react";

import { useCompany } from "@/contexts/CompanyContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";

import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import IconButton from "@/components/ui/IconButton/IconButton";
import Card from "@/components/ui/Card/Card";
import { List } from "@/components/ui/List/List";
import Modal from "@/components/ui/Modal/Modal";

import ContactDrawer from "@/features/contacts/ContactDrawer/ContactDrawer";

import { CompanyRelationshipStageLabel } from "@/constants/enums/companies/company-relationship-stage.enum";
import {
  CompanyStatusColor,
  CompanyStatusLabel,
} from "@/constants/enums/companies/company-status.enum";

import { contactsApi } from "@/services/api/contacts/contacts.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import { formatPhone } from "@/utils/format-phone";

import type { Contact } from "@/services/api/contacts/contacts.types";
import type { ContactFormData } from "@/features/companies/schemas/contacts.schema";

export default function CompanyGeneralPage() {
  const { company, updateCompany } = useCompany();
  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();

  const primaryAddress =
    company.addresses.find((address) => address.isPrimary) ??
    company.addresses[0];

  function sortContacts(contacts: Contact[]) {
    return [...contacts].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });
  }

  function updateContactList(contact: Contact) {
    updateCompany({
      ...company,
      contacts: sortContacts([
        ...company.contacts.filter((item) => item.id !== contact.id),
        contact,
      ]),
    });
  }

  // CADASTRAR CONTATO
  async function handleCreateContact(data: ContactFormData) {
    try {
      const response = await contactsApi.create(company.id, data);

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
      <ContactDrawer
        open
        onClose={closeDrawer}
        onSubmit={handleCreateContact}
        mode="create"
      />,
    );
  }

  // EDITAR CONTATO
  async function handleUpdateContact(contactId: string, data: ContactFormData) {
    try {
      const response = await contactsApi.update(company.id, contactId, data);

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

  function handleOpenEditContactDrawer(contact: Contact) {
    openDrawer(
      <ContactDrawer
        open
        onClose={closeDrawer}
        onSubmit={(data) => handleUpdateContact(contact.id, data)}
        mode="edit"
        contact={contact}
      />,
    );
  }

  // EXCLUIR CONTATO
  async function handleDeleteContact(contact: Contact) {
    try {
      await contactsApi.delete(company.id, contact.id);

      updateCompany({
        ...company,
        contacts: company.contacts.filter((item) => item.id !== contact.id),
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

  function handleOpenDeleteContactModal(contact: Contact) {
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
        <InfoField label="Nome fantasia" value={company.tradeName} />

        <InfoField label="Razão social" value={company.corporateName} />

        <InfoField label="CNPJ" value={company.cnpj} />

        <InfoField
          label="Etapa de relacionamento"
          value={CompanyRelationshipStageLabel(company.relationshipStage)}
        />

        <InfoField
          label="Status"
          value={
            <StatusBadge
              label={CompanyStatusLabel(company.status)}
              color={CompanyStatusColor(company.status)}
            />
          }
        />
      </Card>

      <Card
        title="Endereço principal"
        icon={<MapPin size={20} />}
        description={
          !primaryAddress ? "Nenhum endereço cadastrado." : undefined
        }
      >
        {primaryAddress && (
          <>
            <InfoField label="Identificação" value={primaryAddress.name} />

            <InfoField label="CEP" value={primaryAddress.zipCode} />

            <InfoField label="Logradouro" value={primaryAddress.street} />

            <InfoField label="Número" value={primaryAddress.number} />

            <InfoField label="Complemento" value={primaryAddress.complement} />

            <InfoField label="Bairro" value={primaryAddress.neighborhood} />

            <InfoField label="Cidade" value={primaryAddress.city} />

            <InfoField label="Estado" value={primaryAddress.state} />
          </>
        )}
      </Card>
      <Card
        title="Contatos"
        display="default"
        icon={<PhoneIcon size={20} />}
        actions={
          <IconButton
            action="add"
            size="sm"
            onClick={handleOpenCreateContactDrawer}
          />
        }
      >
        <List
          items={company.contacts}
          keyExtractor={(contact) => contact.id}
          getItem={(contact) => ({
            title: contact.name,
            subtitle: formatPhone(contact.phone) || "-",
            description: contact.email || "-",
          })}
          renderActions={(contact) => (
            <>
              <IconButton
                action="edit"
                size="sm"
                onClick={() => handleOpenEditContactDrawer(contact)}
              />

              <IconButton
                action="delete"
                size="sm"
                onClick={() => handleOpenDeleteContactModal(contact)}
              />
            </>
          )}
        />
      </Card>
      <Card title="Observações" icon={<FileText size={20} />}>
        <InfoField
          label="Informações adicionais"
          value={company.observations}
        />
      </Card>
    </InfoCardGrid>
  );
}
