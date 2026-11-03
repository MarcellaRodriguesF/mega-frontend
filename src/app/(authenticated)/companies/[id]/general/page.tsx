"use client";

import { Buildings, MapPin, FileText } from "@phosphor-icons/react";

import { useCompany } from "@/contexts/CompanyContext";

import InfoCard from "@/components/ui/InfoCard/InfoCard";
import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import { CompanyRelationshipStageLabel } from "@/constants/enums/companies/company-relationship-stage.enum";

export default function CompanyGeneralPage() {
  const { company } = useCompany();

  const primaryAddress =
    company.addresses.find((address) => address.isPrimary) ??
    company.addresses[0];

  return (
    <InfoCardGrid>
      <InfoCard title="Dados cadastrais" icon={<Buildings size={20} />}>
        <InfoField label="Nome fantasia" value={company.tradeName} />

        <InfoField label="Razão social" value={company.corporateName} />

        <InfoField label="CNPJ" value={company.cnpj} />

        <InfoField
          label="Etapa de relacionamento"
          value={CompanyRelationshipStageLabel(company.relationshipStage)}
        />
      </InfoCard>

      <InfoCard
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
      </InfoCard>

      <InfoCard title="Observações" icon={<FileText size={20} />}>
        <InfoField
          label="Informações adicionais"
          value={company.observations}
        />
      </InfoCard>
    </InfoCardGrid>
  );
}
