"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/ui/Button/Button";
import FormActions from "@/components/ui/FormActions/FormActions";
import FormPageLayout from "@/components/layout/FormPageLayout/FormPageLayout";

import PermissionGroup from "@/features/access-profiles/components/PermissionGroup/PermissionGroup";

import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

import { accessProfilesApi } from "@/services/api/access-profiles/access-profiles.api";

import { UserStatus } from "@/constants/enums/users/user-status-record.enum";

import type {
  AccessProfile,
  Permission,
} from "@/services/api/access-profiles/access-profiles.types";

import { useFormChanges } from "@/hooks/useFormChanges";

import styles from "./page.module.css";
import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";
import Select from "@/components/ui/Select/Select";

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
  const router = useRouter();
  const toast = useToast();

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
    setIsLoading(true);

    try {
      const [profileResponse, permissionsResponse] = await Promise.all([
        accessProfilesApi.findById(profileId),
        accessProfilesApi.findPermissions(),
      ]);

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
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível carregar o perfil de acesso.";

      toast.error(message, {
        title: "Erro ao carregar perfil",
      });
    } finally {
      setIsLoading(false);
    }
  }, [profileId, toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

  function handleBack() {
    if (isDirty) {
      const shouldLeave = window.confirm(
        "Existem alterações não salvas. Deseja sair sem salvar?",
      );

      if (!shouldLeave) return;
    }

    router.push("/access-profiles");
  }

  if (isLoading) {
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
        <Button
          text="Voltar para perfis"
          onClick={() => router.push("/access-profiles")}
        />
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title="Editar perfil de acesso"
      description="Gerencie os dados e as permissões deste perfil."
      action={<Button text="Voltar" variant="secondary" onClick={handleBack} />}
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Informações do perfil</h2>
              <p>Defina a identificação e a finalidade deste perfil.</p>
            </div>
          </div>

          <div className={styles.fields}>
            <Input
              label="Nome do perfil"
              placeholder="Ex.: Administrador"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              required
            />
            <Select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as UserStatus)}
              options={[
                { value: UserStatus.ACTIVE, label: "Ativo" },
                { value: UserStatus.INACTIVE, label: "Inativo" },
              ]}
            />
            <Textarea
              label="Descrição"
              placeholder="Descreva a finalidade deste perfil."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={255}
              rows={3}
            />
          </div>
          <div className={styles.profileMetadata}>
            <span>
              Usuários vinculados: <strong>{profile._count.users}</strong>
            </span>
          </div>
        </section>

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
