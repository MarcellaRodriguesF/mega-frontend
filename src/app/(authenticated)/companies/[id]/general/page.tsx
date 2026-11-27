"use client";

import { Buildings, FileText, PhoneIcon } from "@phosphor-icons/react";

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
import { CompanyAddressType } from "@/constants/enums/companies/company-address-type.enum";
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
import AddressCard from "@/components/ui/AddressCard/AddressCard";
import { companiesApi } from "@/services/api/companies/companies.api";
import type { AddressFormData } from "@/features/addresses/schemas/address.schema";
import AddressDrawer from "@/features/addresses/components/AddressDrawer/AddressDrawer";
import { formatCnpj } from "@/utils/format-cnpj";

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

  // EDITAR ENDEREÇO
  function handleOpenEditAddressDrawer() {
    openDrawer(
      <AddressDrawer
        open
        onClose={closeDrawer}
        initialData={primaryAddress}
        onSubmit={handleUpdateAddress}
      />
    );
  }

  async function handleUpdateAddress(data: AddressFormData) {
    try {
      const response = await companiesApi.update(company.id, {
        address: {
          name: primaryAddress?.name ?? "Matriz",
          type: primaryAddress?.type ?? CompanyAddressType.HEADQUARTERS,
          zipCode: data.zipCode,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          latitude: primaryAddress?.latitude ?? null,
          longitude: primaryAddress?.longitude ?? null,
          isPrimary: primaryAddress?.isPrimary ?? true,
          observations: primaryAddress?.observations ?? null,
        },
      });

      updateCompany(response.data);

      closeDrawer();

      toast.success("O endereço foi atualizado com sucesso.", {
        title: "Endereço atualizado!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar o endereço. Tente novamente.";

      toast.error(message, {
        title: "Erro ao atualizar endereço",
      });

      throw error;
    }
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
      />
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
      />
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
      />
    );
  }

  return (
    <InfoCardGrid>
      <Card title="Dados cadastrais" icon={<Buildings size={20} />}>
        <InfoField label="Nome fantasia" value={company.tradeName} />

        <InfoField label="Razão social" value={company.corporateName} />

        <InfoField label="CNPJ" value={formatCnpj(company.cnpj)} />
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

      <AddressCard
        address={primaryAddress}
        onEdit={handleOpenEditAddressDrawer}
      />

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
