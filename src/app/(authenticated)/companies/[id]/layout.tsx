"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Tabs from "@/components/ui/Tabs/Tabs";
import type { PageStateType } from "@/components/ui/PageState/PageState";
import Button from "@/components/ui/Button/Button";

import CompanyDrawer from "@/features/companies/components/CompanyDrawer/CompanyDrawer";

import { companiesApi } from "@/services/api/companies/companies.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { Company } from "@/services/api/companies/companies.types";
import type { CompanyFormData } from "@/features/companies/schemas/company-form.schema";

import { CompanyProvider } from "@/contexts/CompanyContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";

import { PencilIcon, TrashIcon } from "@phosphor-icons/react";
import Modal from "@/components/ui/Modal/Modal";

const companyTabs = [
  { value: "general", label: "Dados gerais" },
  { value: "documents", label: "Documentos" },
  { value: "contacts", label: "Contatos" },
  { value: "opportunities", label: "Oportunidades" },
];

function getPageState(statusCode?: number): PageStateType {
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

  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();

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

  async function handleUpdateCompany(data: CompanyFormData) {
    try {
      const response = await companiesApi.update(params.id, data);

      setCompany(response.data);
      closeDrawer();

      toast.success("Os dados da empresa foram atualizados.", {
        title: "Empresa atualizada!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar a empresa. Tente novamente.";

      toast.error(message, {
        title: "Erro ao atualizar empresa",
      });

      throw error;
    }
  }

  async function handleDeleteCompany() {
    if (!company) return;

    try {
      await companiesApi.delete(company.id);

      closeDrawer();

      toast.success("A empresa foi excluída com sucesso.", {
        title: "Empresa excluída!",
      });

      router.push("/companies");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível excluir a empresa. Tente novamente.";

      toast.error(message, {
        title: "Erro ao excluir empresa",
      });

      throw error;
    }
  }

  function handleOpenEditDrawer() {
    if (!company) return;

    openDrawer(
      <CompanyDrawer
        open
        onClose={closeDrawer}
        onSubmit={handleUpdateCompany}
        mode="edit"
        company={company}
      />,
    );
  }

  function handleOpenDeleteModal() {
    if (!company) return;

    openDrawer(
      <Modal
        open
        variant="danger"
        title="Excluir empresa?"
        description={`A empresa ${company.tradeName} será excluída permanentemente. Essa ação não poderá ser desfeita.`}
        confirmText="Excluir empresa"
        cancelText="Cancelar"
        onConfirm={handleDeleteCompany}
        onClose={closeDrawer}
      />,
    );
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
            <>
              <Button
                variant="outline"
                text={<PencilIcon size={16} />}
                onClick={handleOpenEditDrawer}
              />

              <Button
                variant="outline"
                text={<TrashIcon size={16} />}
                onClick={handleOpenDeleteModal}
              />
            </>
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
