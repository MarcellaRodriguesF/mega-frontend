"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Tabs from "@/components/ui/Tabs/Tabs";
import type { PageStateType } from "@/components/ui/PageState/PageState";

import { companiesApi } from "@/services/api/companies/companies.api";
import { ApiError } from "@/services/api/api-client";

import {
  CompanyStatusColor,
  CompanyStatusLabel,
} from "@/constants/enums/companies/company-status.enum";

import type { Company } from "@/services/api/companies/companies.types";

import { CompanyProvider } from "@/contexts/CompanyContext";

const companyTabs = [
  { value: "general", label: "Dados gerais" },
  { value: "documents", label: "Documentos" },
  { value: "contacts", label: "Contatos" },
  { value: "opportunities", label: "Oportunidades" },
];

function getPageState(statusCode?: number): PageStateType | undefined {
  if (!statusCode) return "error";

  switch (statusCode) {
    case 403:
      return "forbidden";
    case 404:
      return "not-found";
    default:
      return "error";
  }
}

export default function CompanyDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusCode, setStatusCode] = useState<number | undefined>();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCompany() {
      try {
        setIsLoading(true);
        setStatusCode(undefined);

        const response = await companiesApi.findById(params.id);

        if (isMounted) {
          setCompany(response.data);
        }
      } catch (error) {
        if (!isMounted) return;

        setCompany(null);
        setStatusCode(error instanceof ApiError ? error.status : 500);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCompany();

    return () => {
      isMounted = false;
    };
  }, [params.id, retryCount]);

  const activeTab =
    companyTabs.find((tab) => pathname.endsWith(`/${tab.value}`))?.value ??
    "general";

  function handleTabChange(value: string) {
    router.push(`/companies/${params.id}/${value}`);
  }

  const page = (
    <PageContainer
      state={
        isLoading ? "loading" : !company ? getPageState(statusCode) : undefined
      }
      stateAction={
        !isLoading && !company
          ? {
              label: "Tentar novamente",
              onClick: () => setRetryCount((count) => count + 1),
            }
          : undefined
      }
    >
      <PageHeader
        title={company?.tradeName ?? "Detalhes da empresa"}
        description="Detalhes e informações cadastrais da empresa."
        action={
          company ? (
            <StatusBadge
              label={CompanyStatusLabel(company.status)}
              color={CompanyStatusColor(company.status)}
            />
          ) : undefined
        }
      />

      <Tabs items={companyTabs} value={activeTab} onChange={handleTabChange} />

      {!isLoading && company ? children : null}
    </PageContainer>
  );

  return company ? (
    <CompanyProvider company={company}>{page}</CompanyProvider>
  ) : (
    page
  );
}
