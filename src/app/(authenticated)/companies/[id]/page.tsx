"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import InfoCard from "@/components/ui/InfoCard/InfoCard";
import InfoField from "@/components/ui/InfoField/InfoField";

import { useToast } from "@/contexts/ToastContext";

import { companiesApi } from "@/services/api/companies/companies.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import {
  CompanyStatusColor,
  CompanyStatusLabel,
} from "@/constants/enums/companies/company-status.enum";

import { CompanyRelationshipStageLabel } from "@/constants/enums/companies/company-relationship-stage.enum";

import type { Company } from "@/services/api/companies/companies.types";
import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";

export default function CompanyDetailsPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      try {
        setIsLoading(true);

        const response = await companiesApi.findById(params.id);

        setCompany(response.data);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? getApiErrorMessage(err.code, err.message)
            : "Não foi possível carregar os dados da empresa.";

        toast.error(message, {
          title: "Erro ao carregar empresa",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadCompany();
  }, [params.id]);

  if (isLoading) {
    return (
      <PageContainer>
        <p>Carregando dados da empresa...</p>
      </PageContainer>
    );
  }

  if (!company) {
    return (
      <PageContainer>
        <PageHeader
          title="Empresa não encontrada"
          description="Não foi possível localizar os dados desta empresa."
        />
      </PageContainer>
    );
  }

  const primaryAddress =
    company.addresses.find((address) => address.isPrimary) ??
    company.addresses[0];

  return (
    <PageContainer>
      <PageHeader
        title={company.tradeName}
        description="Detalhes e informações cadastrais da empresa."
      />

      <InfoCardGrid>
        <InfoCard
          title="Dados da empresa"
          description="Informações cadastrais e comerciais."
          actions={
            <StatusBadge
              label={CompanyStatusLabel(company.status)}
              color={CompanyStatusColor(company.status)}
            />
          }
        >
          <InfoField label="Nome fantasia" value={company.tradeName} />

          <InfoField label="Razão social" value={company.corporateName} />

          <InfoField label="CNPJ" value={company.cnpj} />

          <InfoField
            label="Relacionamento"
            value={CompanyRelationshipStageLabel(company.relationshipStage)}
          />
        </InfoCard>

        <InfoCard
          title="Endereço principal"
          description={
            !primaryAddress ? "Nenhum endereço cadastrado." : undefined
          }
        >
          {primaryAddress && (
            <>
              <InfoField label="Logradouro" value={primaryAddress.street} />

              <InfoField label="Número" value={primaryAddress.number} />

              <InfoField
                label="Complemento"
                value={primaryAddress.complement}
              />

              <InfoField label="Bairro" value={primaryAddress.neighborhood} />

              <InfoField label="Cidade" value={primaryAddress.city} />

              <InfoField label="Estado" value={primaryAddress.state} />

              <InfoField label="CEP" value={primaryAddress.zipCode} />
            </>
          )}
        </InfoCard>

        <InfoCard
          title="Observações"
          description={
            !company.observations ? "Nenhuma observação registrada." : undefined
          }
        >
          <InfoField label="Observações" value={company.observations} />
        </InfoCard>
      </InfoCardGrid>
    </PageContainer>
  );
}
