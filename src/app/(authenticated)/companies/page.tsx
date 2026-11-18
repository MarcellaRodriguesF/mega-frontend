"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

import CompanyDrawer from "@/features/companies/components/CompanyDrawer/CompanyDrawer";
import CompanyList from "@/features/companies/components/CompanyList/CompanyList";

import { useToast } from "@/contexts/ToastContext";
import { useDrawer } from "@/hooks/useDrawer";

import { companiesApi } from "@/services/api/companies/companies.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { CompanyFormData } from "@/features/companies/schemas/company-form.schema";
import type { Company } from "@/services/api/companies/companies.types";

export default function CompaniesPage() {
  const [isListLoading, setIsListLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  const toast = useToast();
  const { openDrawer, closeDrawer } = useDrawer();

  const loadCompanies = useCallback(async () => {
    setIsListLoading(true);

    try {
      const response = await companiesApi.findAll();
      setCompanies(response.data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? getApiErrorMessage(err.code, err.message)
          : "Não foi possível carregar as empresas.";

      toast.error(message, {
        title: "Erro ao carregar empresas",
      });
    } finally {
      setIsListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  async function handleCreateCompany(data: CompanyFormData) {
    try {
      await companiesApi.create(data);

      closeDrawer();

      toast.success("A empresa foi cadastrada com sucesso.", {
        title: "Empresa cadastrada!",
      });

      await loadCompanies();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? getApiErrorMessage(err.code, err.message)
          : "Não foi possível cadastrar a empresa. Tente novamente.";

      toast.error(message, {
        title: "Erro ao cadastrar empresa",
      });

      throw err;
    }
  }

  function handleOpenCreateDrawer() {
    openDrawer(
      <CompanyDrawer
        open
        onClose={closeDrawer}
        onSubmit={handleCreateCompany}
        mode="create"
      />,
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Empresas"
        description="Gerencie as empresas e seus relacionamentos comerciais."
        action={<Button text="Nova empresa" onClick={handleOpenCreateDrawer} />}
      />

      <CompanyList companies={companies} isLoading={isListLoading} />
    </PageContainer>
  );
}
