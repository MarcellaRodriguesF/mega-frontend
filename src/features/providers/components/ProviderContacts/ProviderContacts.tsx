"use client";

import { useMemo } from "react";
import { PhoneIcon } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import IconButton from "@/components/ui/IconButton/IconButton";
import { List } from "@/components/ui/List/List";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";

import { formatPhone } from "@/utils/format-phone";

import type { ProviderContact } from "@/services/api/providers/providers.types";

import styles from "./ProviderContacts.module.css";
import ContactActions from "@/components/ui/ContactActions/ContactActions";

interface ProviderContactsProps {
  contacts: ProviderContact[];
  onAdd: () => void;
  onEdit: (contact: ProviderContact) => void;
  onDelete: (contact: ProviderContact) => void;
}

export default function ProviderContacts({
  contacts,
  onAdd,
  onEdit,
  onDelete,
}: ProviderContactsProps) {
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }

      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [contacts]);

  return (
    <Card
      title="Contatos"
      display="default"
      icon={<PhoneIcon size={20} />}
      actions={<IconButton action="add" size="sm" onClick={onAdd} />}
    >
      <List
        items={sortedContacts}
        keyExtractor={(contact) => contact.id}
        getItem={(contact) => ({
          title: (
            <span className={styles.title}>
              {contact.name}
              {contact.isPrimary && (
                <StatusBadge label="Principal" color="green" />
              )}
            </span>
          ),
          subtitle: contact.role || "Cargo não informado",
          description: (
            <ContactActions phone={contact.phone} label="Telefone" />
          ),
        })}
        renderActions={(contact) => (
          <>
            <IconButton
              action="edit"
              size="sm"
              onClick={() => onEdit(contact)}
            />

            <IconButton
              action="delete"
              size="sm"
              onClick={() => onDelete(contact)}
            />
          </>
        )}
      />
    </Card>
  );
}
