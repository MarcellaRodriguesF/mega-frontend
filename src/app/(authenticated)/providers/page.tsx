"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";

import ProviderDrawer from "@/features/providers/components/ProviderDrawer/ProviderDrawer";
import ProviderList from "@/features/providers/components/ProviderList/ProviderList";

import { useToast } from "@/contexts/ToastContext";
import { useDrawer } from "@/hooks/useDrawer";

import { providersApi } from "@/services/api/providers/providers.api";
import { providerContactsApi } from "@/services/api/provider-contacts/provider-contacts.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import type { ProviderFormData } from "@/features/providers/schemas/provider-form.schema";
import type { Provider } from "@/services/api/providers/providers.types";

export default function ProvidersPage() {
  const [isListLoading, setIsListLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const toast = useToast();
  const { openDrawer, closeDrawer } = useDrawer();

  useEffect(() => {
    let isMounted = true;

    async function loadProviders() {
      try {
        setIsListLoading(true);
        setHasLoadError(false);

        const response = await providersApi.findAll();

        if (!isMounted) return;

        setProviders(response.data);
      } catch (err) {
        if (!isMounted) return;

        setProviders([]);
        setHasLoadError(true);

        const message =
          err instanceof ApiError
            ? getApiErrorMessage(err.code, err.message)
            : "Não foi possível carregar os provedores.";

        toast.error(message, {
          title: "Erro ao carregar provedores",
        });
      } finally {
        if (isMounted) {
          setIsListLoading(false);
        }
      }
    }

    loadProviders();

    return () => {
      isMounted = false;
    };
  }, [toast, reloadKey]);

  async function handleCreateProvider(data: ProviderFormData) {
    try {
      const response = await providersApi.create({
        name: data.name,
        observations: data.observations,
        phone: data.phone,
      });

      if (data.contact) {
        try {
          await providerContactsApi.create(response.data.id, data.contact);
        } catch (contactError) {
          closeDrawer();

          const message =
            contactError instanceof ApiError
              ? getApiErrorMessage(contactError.code, contactError.message)
              : "Não foi possível cadastrar o contato.";

          toast.error(message, {
            title: "Provedor cadastrado, mas o contato não foi salvo",
          });

          setReloadKey((key) => key + 1);
          return;
        }
      }

      closeDrawer();

      toast.success("O provedor foi cadastrado com sucesso.", {
        title: "Provedor cadastrado!",
      });

      setReloadKey((key) => key + 1);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? getApiErrorMessage(err.code, err.message)
          : "Não foi possível cadastrar o provedor. Tente novamente.";

      toast.error(message, {
        title: "Erro ao cadastrar provedor",
      });

      throw err;
    }
  }

  function handleOpenCreateDrawer() {
    openDrawer(
      <ProviderDrawer
        open
        onClose={closeDrawer}
        onSubmit={handleCreateProvider}
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Provedores"
        description="Gerencie os provedores e suas informações de contato."
        action={
          <Button text="Novo provedor" onClick={handleOpenCreateDrawer} />
        }
      />

      {hasLoadError && !isListLoading ? (
        <PageState
          type="error"
          title="Não foi possível carregar os provedores"
          description="Ocorreu um erro ao buscar a listagem. Tente novamente."
          action={{
            label: "Tentar novamente",
            onClick: () => setReloadKey((key) => key + 1),
          }}
        />
      ) : (
        <ProviderList providers={providers} isLoading={isListLoading} />
      )}
    </PageContainer>
  );
}
