"use client";

import { useState } from "react";

import Button from "@/components/ui/Button/Button";

import UserForm from "@/features/users/components/UserForm/UserForm";

import type { UserFormData } from "@/features/users/schemas/user-form.schema";

import type { AccessProfile, User } from "@/services/api/users/users.types";
import Drawer from "@/components/layout/Drawer/Drawer";

interface UserDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  user?: User | null;
  profiles: AccessProfile[];
}

export default function UserDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  user,
  profiles,
}: UserDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(user);

  async function handleSubmit(data: UserFormData) {
    setIsSubmitting(true);

    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar usuário" : "Novo usuário"}
      description={
        isEditing
          ? "Atualize os dados e o perfil de acesso do usuário."
          : "Cadastre um novo usuário na plataforma."
      }
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button
            text="Cancelar"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          />

          <Button
            text={isEditing ? "Salvar alterações" : "Cadastrar usuário"}
            type="submit"
            form="user-form"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          />
        </div>
      }
    >
      <UserForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        user={user}
        profiles={profiles}
      />
    </Drawer>
  );
}
