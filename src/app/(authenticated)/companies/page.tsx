"use client";

import { useState } from "react";

import Button from "@/components/ui/Button/Button";
import FormMessage from "@/components/ui/FormMessage/FormMessage";

import CompanyDrawer from "@/features/companies/components/CompanyDrawer/CompanyDrawer";

import { companiesApi } from "@/services/api/companies/companies.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { CompanyFormData } from "@/features/companies/schemas/company-form.schema";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

export default function CompaniesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleCreateCompany(data: CompanyFormData) {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await companiesApi.create(data);

      setDrawerOpen(false);
      setSuccess("Empresa cadastrada com sucesso.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getApiErrorMessage(err.code, err.message));
      } else {
        setError("Não foi possível cadastrar a empresa. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenDrawer() {
    setError("");
    setSuccess("");
    setDrawerOpen(true);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Empresas"
        description="Gerencie as empresas e seus relacionamentos comerciais."
        action={<Button text="Nova empresa" onClick={handleOpenDrawer} />}
      />

      {success && <p role="status">{success}</p>}

      {error && <FormMessage message={error} />}

      <CompanyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreateCompany}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
