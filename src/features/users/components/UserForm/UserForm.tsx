"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import FormSection from "@/components/ui/FormSection/FormSection";

import {
  userFormSchema,
  type UserFormData,
} from "@/features/users/schemas/user-form.schema";

import type { AccessProfile, User } from "@/services/api/users/users.types";

import { UserStatus } from "@/constants/enums/users/user-status-record.enum";

import styles from "./UserForm.module.css";

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  user?: User | null;
  profiles: AccessProfile[];
}

export default function UserForm({
  onSubmit,
  isLoading = false,
  user,
  profiles,
}: UserFormProps) {
  const isEditing = Boolean(user);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accessProfileId: "",
      status: UserStatus.ACTIVE,
    },
  });

  useEffect(() => {
    reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      accessProfileId: user?.accessProfileId ?? "",
      status: user?.status ?? UserStatus.ACTIVE,
    });
  }, [user, reset]);

  const profileOptions = profiles
    .filter(
      (profile) =>
        profile.status === UserStatus.ACTIVE ||
        profile.id === user?.accessProfileId,
    )
    .map((profile) => ({
      value: profile.id,
      label: profile.name,
    }));

  const statusOptions = [
    {
      value: UserStatus.ACTIVE,
      label: "Ativo",
    },
    {
      value: UserStatus.INACTIVE,
      label: "Inativo",
    },
  ];

  async function handleFormSubmit(data: UserFormData) {
    await onSubmit({
      ...data,
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password?.trim() || undefined,
    });
  }

  return (
    <form
      id="user-form"
      autoComplete="off"
      className={styles.form}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <FormSection
        title="Informações do usuário"
        description="Preencha os dados de identificação e acesso."
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label="Nome completo"
              placeholder="Ex.: João da Silva"
              autoComplete="off"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              error={errors.name?.message}
              required
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              label="E-mail"
              autoComplete="off"
              placeholder="usuario@empresa.com.br"
              type="email"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              error={errors.email?.message}
              required
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              label={isEditing ? "Nova senha" : "Senha"}
              placeholder={
                isEditing
                  ? "Deixe em branco para manter a senha atual"
                  : "Digite uma senha"
              }
              type="password"
              autoComplete="new-password"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              showPasswordToggle
              error={errors.password?.message}
              required={!isEditing}
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="accessProfileId"
          control={control}
          render={({ field }) => (
            <Select
              label="Perfil de acesso"
              placeholder="Selecione um perfil"
              options={profileOptions}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              error={errors.accessProfileId?.message}
              required
              disabled={isLoading}
            />
          )}
        />

        {isEditing && (
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status do usuário"
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.status?.message}
                required
                disabled={isLoading}
              />
            )}
          />
        )}
      </FormSection>
    </form>
  );
}
