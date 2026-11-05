"use client";

import {
  Buildings,
  MapPin,
  FileText,
  PhoneIcon,
  PencilIcon,
} from "@phosphor-icons/react";

import { useCompany } from "@/contexts/CompanyContext";

import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import { CompanyRelationshipStageLabel } from "@/constants/enums/companies/company-relationship-stage.enum";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import {
  CompanyStatusColor,
  CompanyStatusLabel,
} from "@/constants/enums/companies/company-status.enum";
import Button from "@/components/ui/Button/Button";
import { List } from "@/components/ui/List/List";
import Card from "@/components/ui/Card/Card";
import { formatPhone } from "@/utils/format-phone";
import IconButton from "@/components/ui/IconButton/IconButton";

export default function CompanyGeneralPage() {
  const { company } = useCompany();

  const primaryAddress =
    company.addresses.find((address) => address.isPrimary) ??
    company.addresses[0];

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

      <Card title="Observações" icon={<FileText size={20} />}>
        <InfoField
          label="Informações adicionais"
          value={company.observations}
        />
      </Card>

      <Card
        title="Contatos"
        display="default"
        icon={<PhoneIcon size={20} />}
        actions={<IconButton action="add" size="sm" />}
      >
        <List
          items={company.contacts}
          keyExtractor={(contact) => contact.id}
          getItem={(contact) => ({
            title: contact.name,
            subtitle: formatPhone(contact.phone) || "-",
            description: contact.email || "-",
          })}
          renderActions={(contact) => <IconButton action="edit" size="sm" />}
        />
      </Card>
    </InfoCardGrid>
  );
}
