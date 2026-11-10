"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

import AccessProfileDrawer from "@/features/access-profiles/components/AccessProfileDrawer/AccessProfileDrawer";
import AccessProfileList from "@/features/access-profiles/components/AccessProfileList/AccessProfileList";

import type { AccessProfileFormData } from "@/features/access-profiles/schemas/access-profile-form.schema";
import type { AccessProfile } from "@/services/api/access-profiles/access-profiles.types";

import { accessProfilesApi } from "@/services/api/access-profiles/access-profiles.api";

import { useToast } from "@/contexts/ToastContext";
import { useDrawer } from "@/hooks/useDrawer";

import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

export default function AccessProfilesPage() {
  const router = useRouter();

  const [isListLoading, setIsListLoading] = useState(true);
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);

  const toast = useToast();
  const { openDrawer, closeDrawer } = useDrawer();

  const loadProfiles = useCallback(async () => {
    setIsListLoading(true);

    try {
      const response = await accessProfilesApi.findAll();
      setProfiles(response.data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? getApiErrorMessage(err.code, err.message)
          : "Não foi possível carregar os perfis de acesso.";

      toast.error(message, {
        title: "Erro ao carregar perfis",
      });
    } finally {
      setIsListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  async function handleCreateAccessProfile(data: AccessProfileFormData) {
    try {
      const response = await accessProfilesApi.create({
        name: data.name,
        description: data.description.trim() || null,
        permissionCodes: [],
      });

      closeDrawer();

      toast.success("O perfil foi criado com sucesso.", {
        title: "Perfil cadastrado!",
      });

      router.push(`/access-profiles/${response.data.id}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? getApiErrorMessage(err.code, err.message)
          : "Não foi possível cadastrar o perfil. Tente novamente.";

      toast.error(message, {
        title: "Erro ao cadastrar perfil",
      });

      throw err;
    }
  }

  function handleOpenCreateDrawer() {
    openDrawer(
      <AccessProfileDrawer
        open
        onClose={closeDrawer}
        onSubmit={handleCreateAccessProfile}
      />,
    );
  }

  function handleOpenProfile(profile: AccessProfile) {
    router.push(`/access-profiles/${profile.id}`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Perfis de acesso"
        description="Gerencie os perfis e configure as permissões de cada grupo de usuários."
        action={<Button text="Novo perfil" onClick={handleOpenCreateDrawer} />}
      />

      <AccessProfileList
        profiles={profiles}
        isLoading={isListLoading}
        onEdit={handleOpenProfile}
      />
    </PageContainer>
  );
}
