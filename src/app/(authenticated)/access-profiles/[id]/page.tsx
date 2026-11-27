"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import AccessProfileDrawer from "@/features/access-profiles/components/AccessProfileDrawer/AccessProfileDrawer";
import FormActions from "@/components/ui/FormActions/FormActions";
import FormPageLayout from "@/components/layout/FormPageLayout/FormPageLayout";
import { useDrawer } from "@/hooks/useDrawer";

import PermissionGroup from "@/features/access-profiles/components/PermissionGroup/PermissionGroup";

import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import { accessProfilesApi } from "@/services/api/access-profiles/access-profiles.api";

import {
  UserStatus,
  UserStatusColor,
  UserStatusLabel,
} from "@/constants/enums/users/user-status-record.enum";

import type {
  AccessProfile,
  Permission,
} from "@/services/api/access-profiles/access-profiles.types";

import { useFormChanges } from "@/hooks/useFormChanges";

import styles from "./page.module.css";

interface ProfileFormData {
  name: string;
  description: string;
  status: UserStatus;
  permissionCodes: string[];
}

const FORM_ID = "access-profile-form";

function normalizePermissionCodes(codes: string[]) {
  return [...codes].sort();
}

export default function AccessProfileDetailsPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const { openDrawer, closeDrawer } = useDrawer();

  const profileId = params.id;

  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [initialData, setInitialData] = useState<ProfileFormData | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<UserStatus>(UserStatus.ACTIVE);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const profileLoadRequestId = useRef(0);

  const currentData = useMemo<ProfileFormData>(
    () => ({
      name,
      description,
      status,
      permissionCodes: normalizePermissionCodes(selectedCodes),
    }),
    [name, description, status, selectedCodes],
  );

  const { isDirty } = useFormChanges(initialData, currentData);

  const loadProfile = useCallback(async () => {
    const requestId = ++profileLoadRequestId.current;

    try {
      const [profileResponse, permissionsResponse] = await Promise.all([
        accessProfilesApi.findById(profileId),
        accessProfilesApi.findPermissions(),
      ]);

      if (requestId !== profileLoadRequestId.current) return;

      const loadedProfile = profileResponse.data;

      const permissionCodes = normalizePermissionCodes(
        loadedProfile.profilePermissions.map((item) => item.permission.code),
      );

      const formData: ProfileFormData = {
        name: loadedProfile.name,
        description: loadedProfile.description ?? "",
        status: loadedProfile.status,
        permissionCodes,
      };

      setProfile(loadedProfile);
      setPermissions(permissionsResponse.data);

      setName(formData.name);
      setDescription(formData.description);
      setStatus(formData.status);
      setSelectedCodes(formData.permissionCodes);

      setInitialData(formData);
    } catch (error) {
      if (requestId !== profileLoadRequestId.current) return;

      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível carregar o perfil de acesso.";

      toast.error(message, {
        title: "Erro ao carregar perfil",
      });
    } finally {
      if (requestId === profileLoadRequestId.current) setIsLoading(false);
    }
  }, [profileId, toast]);

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (isActive) void loadProfile();
    });

    return () => {
      isActive = false;
      profileLoadRequestId.current += 1;
    };
  }, [loadProfile]);

  function handleRetryProfileLoad() {
    setIsLoading(true);
    void loadProfile();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile || !isDirty || isSaving) return;

    setIsSaving(true);

    try {
      const response = await accessProfilesApi.update(profile.id, {
        name: name.trim(),
        description: description.trim() || null,
        status,
        permissionCodes: normalizePermissionCodes(selectedCodes),
      });

      const updatedProfile = response.data;

      const savedData: ProfileFormData = {
        name: updatedProfile.name,
        description: updatedProfile.description ?? "",
        status: updatedProfile.status,
        permissionCodes: normalizePermissionCodes(
          updatedProfile.profilePermissions.map((item) => item.permission.code),
        ),
      };

      setProfile(updatedProfile);
      setName(savedData.name);
      setDescription(savedData.description);
      setStatus(savedData.status);
      setSelectedCodes(savedData.permissionCodes);
      setInitialData(savedData);

      toast.success("As alterações foram salvas com sucesso.", {
        title: "Perfil atualizado!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível salvar as alterações.";

      toast.error(message, {
        title: "Erro ao atualizar perfil",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (!initialData) return;

    setName(initialData.name);
    setDescription(initialData.description);
    setStatus(initialData.status);
    setSelectedCodes(initialData.permissionCodes);
  }

  async function handleUpdateProfileInfo(data: {
    name: string;
    description: string;
    status?: UserStatus;
  }) {
    if (!profile || isSaving) return;

    setIsSaving(true);

    try {
      const response = await accessProfilesApi.update(profile.id, {
        name: data.name.trim(),
        description: data.description.trim() || null,
        status: data.status ?? profile.status,
      });

      const updatedProfile = response.data;
      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setDescription(updatedProfile.description ?? "");
      setStatus(updatedProfile.status);
      setInitialData((current) =>
        current
          ? {
              ...current,
              name: updatedProfile.name,
              description: updatedProfile.description ?? "",
              status: updatedProfile.status,
            }
          : current,
      );

      toast.success("As informações do perfil foram salvas.", {
        title: "Perfil atualizado!",
      });
      closeDrawer();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível salvar as informações do perfil.";

      toast.error(message, { title: "Erro ao atualizar perfil" });
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenEditDrawer() {
    if (!profile) return;

    openDrawer(
      <AccessProfileDrawer
        open
        profile={profile}
        isLoading={isSaving}
        onClose={closeDrawer}
        onSubmit={handleUpdateProfileInfo}
      />,
    );
  }

  if (isLoading || profile?.id !== profileId) {
    return (
      <FormPageLayout
        title="Carregando perfil..."
        description="Aguarde enquanto buscamos os dados."
      >
        <div className={styles.loading}>Carregando...</div>
      </FormPageLayout>
    );
  }

  if (!profile || !initialData) {
    return (
      <FormPageLayout
        title="Perfil de acesso"
        description="Não foi possível carregar os dados deste perfil."
      >
        <Button text="Tentar novamente" onClick={handleRetryProfileLoad} />
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title={profile.name}
      description="Configure os módulos e as permissões disponíveis para este perfil."
      action={
        <div className={styles.pageActions}>
          <IconButton
            action="edit"
            size="md"
            label="Editar informações do perfil"
            onClick={handleOpenEditDrawer}
          />
        </div>
      }
    >
      <section className={styles.profileSummary} aria-label="Dados do perfil">
        <StatusBadge
          label={UserStatusLabel(profile.status)}
          color={UserStatusColor(profile.status)}
        />
        <p>{profile.description || "Sem descrição cadastrada."}</p>
        <span className={styles.userCount}>
          Usuários vinculados: <strong>{profile._count.users}</strong>
        </span>
      </section>

      <form id={FORM_ID} onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Permissões de acesso</h2>
              <p>
                Selecione os módulos e as funcionalidades que este perfil poderá
                acessar.
              </p>
            </div>
          </div>

          <PermissionGroup
            permissions={permissions}
            selectedCodes={selectedCodes}
            onChange={setSelectedCodes}
          />
        </section>
      </form>

      <FormActions
        formId={FORM_ID}
        onCancel={handleCancel}
        isDirty={isDirty}
        isSaving={isSaving}
      />
    </FormPageLayout>
  );
}
