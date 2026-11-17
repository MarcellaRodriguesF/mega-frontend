"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

import UserList from "@/features/users/components/UserList/UserList";

import type { UserFormData } from "@/features/users/schemas/user-form.schema";

import type { AccessProfile, User } from "@/services/api/users/users.types";

import { usersApi } from "@/services/api/users/users.api";
import { accessProfilesApi } from "@/services/api/access-profiles/access-profiles.api";

import { useToast } from "@/contexts/ToastContext";
import { useDrawer } from "@/hooks/useDrawer";

import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import UserDrawer from "@/features/users/components/UserDrawer/UserDrawer";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isProfilesLoading, setIsProfilesLoading] = useState(false);

  const toast = useToast();
  const { openDrawer, closeDrawer } = useDrawer();

  const loadUsers = useCallback(async () => {
    setIsListLoading(true);

    try {
      const response = await usersApi.findAll();
      setUsers(response.data);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível carregar os usuários.";

      toast.error(message, {
        title: "Erro ao carregar usuários",
      });
    } finally {
      setIsListLoading(false);
    }
  }, [toast]);

  const loadProfiles = useCallback(async () => {
    setIsProfilesLoading(true);

    try {
      const response = await accessProfilesApi.findAll();
      setProfiles(response.data);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível carregar os perfis de acesso.";

      toast.error(message, {
        title: "Erro ao carregar perfis",
      });
    } finally {
      setIsProfilesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
    loadProfiles();
  }, [loadUsers, loadProfiles]);

  async function handleCreateUser(data: UserFormData) {
    try {
      if (!data.password) {
        throw new Error("A senha é obrigatória.");
      }

      await usersApi.create({
        name: data.name,
        email: data.email,
        password: data.password,
        accessProfileId: data.accessProfileId,
      });

      closeDrawer();

      toast.success("O usuário foi cadastrado com sucesso.", {
        title: "Usuário cadastrado!",
      });

      await loadUsers();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o usuário.";

      toast.error(message, {
        title: "Erro ao cadastrar usuário",
      });

      throw error;
    }
  }

  async function handleUpdateUser(data: UserFormData, user: User) {
    try {
      await usersApi.update(user.id, {
        name: data.name,
        email: data.email,
        accessProfileId: data.accessProfileId,
        status: data.status,
        ...(data.password ? { password: data.password } : {}),
      });

      closeDrawer();

      toast.success("O usuário foi atualizado com sucesso.", {
        title: "Usuário atualizado!",
      });

      await loadUsers();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar o usuário.";

      toast.error(message, {
        title: "Erro ao atualizar usuário",
      });

      throw error;
    }
  }

  function handleOpenCreateDrawer() {
    openDrawer(
      <UserDrawer
        open
        onClose={closeDrawer}
        onSubmit={handleCreateUser}
        profiles={profiles}
        isLoading={isProfilesLoading}
      />,
    );
  }

  function handleOpenEditDrawer(user: User) {
    openDrawer(
      <UserDrawer
        open
        onClose={closeDrawer}
        onSubmit={(data) => handleUpdateUser(data, user)}
        user={user}
        profiles={profiles}
        isLoading={isProfilesLoading}
      />,
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários e seus respectivos perfis de acesso."
        action={
          <Button
            text="Novo usuário"
            onClick={handleOpenCreateDrawer}
            disabled={profiles.length === 0 || isProfilesLoading}
          />
        }
      />

      <UserList
        users={users}
        isLoading={isListLoading}
        onEdit={handleOpenEditDrawer}
      />
    </PageContainer>
  );
}
