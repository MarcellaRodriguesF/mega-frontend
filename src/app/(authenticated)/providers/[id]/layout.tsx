"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Tabs from "@/components/ui/Tabs/Tabs";
import type { PageStateType } from "@/components/ui/PageState/PageState";
import IconButton from "@/components/ui/IconButton/IconButton";
import Modal from "@/components/ui/Modal/Modal";

import ProviderDrawer from "@/features/providers/components/ProviderDrawer/ProviderDrawer";

import { ProviderContextProvider } from "@/contexts/ProviderContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";

import { providersApi } from "@/services/api/providers/providers.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { ProviderEditFormData } from "@/features/providers/schemas/provider-form.schema";
import type { Provider } from "@/services/api/providers/providers.types";

const providerTabs = [
  { value: "general", label: "Dados gerais" },
  { value: "units", label: "Unidades" },
  { value: "tickets", label: "Chamados" },
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

export default function ProviderDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusCode, setStatusCode] = useState<number | undefined>();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadProvider() {
      try {
        setIsLoading(true);
        setStatusCode(undefined);

        const response = await providersApi.findById(params.id);

        if (isMounted) {
          setProvider(response.data);
        }
      } catch (error) {
        if (!isMounted) return;

        setProvider(null);
        setStatusCode(error instanceof ApiError ? error.status : 500);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProvider();

    return () => {
      isMounted = false;
    };
  }, [params.id, retryCount]);

  const activeTab =
    providerTabs.find((tab) => pathname.endsWith(`/${tab.value}`))?.value ??
    "general";

  function handleTabChange(value: string) {
    router.push(`/providers/${params.id}/${value}`);
  }

  async function handleUpdateProvider(data: ProviderEditFormData) {
    try {
      const response = await providersApi.update(params.id, {
        name: data.name,
        observations: data.observations,
        status: data.status,
      });

      setProvider(response.data);
      closeDrawer();

      toast.success("Os dados do provedor foram atualizados.", {
        title: "Provedor atualizado!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar o provedor. Tente novamente.";

      toast.error(message, {
        title: "Erro ao atualizar provedor",
      });

      throw error;
    }
  }

  async function handleDeleteProvider() {
    if (!provider) return;

    try {
      await providersApi.delete(provider.id);

      closeDrawer();

      toast.success("O provedor foi excluído com sucesso.", {
        title: "Provedor excluído!",
      });

      router.push("/providers");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível excluir o provedor. Tente novamente.";

      toast.error(message, {
        title: "Erro ao excluir provedor",
      });

      throw error;
    }
  }

  function handleOpenEditDrawer() {
    if (!provider) return;

    openDrawer(
      <ProviderDrawer
        open
        mode="edit"
        provider={provider}
        onClose={closeDrawer}
        onSubmit={handleUpdateProvider}
      />,
    );
  }

  function handleOpenDeleteModal() {
    if (!provider) return;

    openDrawer(
      <Modal
        open
        variant="danger"
        title="Excluir provedor?"
        description={`O provedor ${provider.name} será excluído permanentemente. Essa ação não poderá ser desfeita.`}
        confirmText="Excluir provedor"
        cancelText="Cancelar"
        onConfirm={handleDeleteProvider}
        onClose={closeDrawer}
      />,
    );
  }

  const page = (
    <PageContainer
      state={
        isLoading
          ? "loading"
          : !provider
            ? getPageState(statusCode)
            : undefined
      }
      stateAction={
        !isLoading && !provider
          ? {
              label: "Tentar novamente",
              onClick: () => setRetryCount((count) => count + 1),
            }
          : undefined
      }
    >
      <PageHeader
        title={provider?.name ?? "Detalhes do provedor"}
        description="Detalhes e informações cadastrais do provedor."
        action={
          provider ? (
            <>
              <IconButton
                action="edit"
                onClick={handleOpenEditDrawer}
                size="md"
              />

              <IconButton
                action="delete"
                onClick={handleOpenDeleteModal}
                size="md"
              />
            </>
          ) : undefined
        }
      />

      <Tabs
        items={providerTabs}
        value={activeTab}
        onChange={handleTabChange}
      />

      {!isLoading && provider ? children : null}
    </PageContainer>
  );

  return provider ? (
    <ProviderContextProvider provider={provider} updateProvider={setProvider}>
      {page}
    </ProviderContextProvider>
  ) : (
    page
  );
}
