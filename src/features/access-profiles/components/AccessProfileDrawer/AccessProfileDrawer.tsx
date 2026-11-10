"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import AccessProfileForm from "../AccessProfileForm/AccessProfileForm";

import type { AccessProfileFormData } from "@/features/access-profiles/schemas/access-profile-form.schema";
import type { AccessProfile } from "@/services/api/access-profiles/access-profiles.types";

import styles from "./AccessProfileDrawer.module.css";

interface AccessProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AccessProfileFormData) => void | Promise<void>;
  isLoading?: boolean;
  profile?: AccessProfile;
}

export default function AccessProfileDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  profile,
}: AccessProfileDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = isLoading || isSubmitting;

  async function handleSubmit(data: AccessProfileFormData) {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Novo perfil de acesso"
      description="Cadastre o nome e a finalidade do perfil. As permissões serão configuradas em seguida."
      footer={
        <div className={styles.actions}>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={onClose}
            disabled={loading}
          />

          <Button
            text="Criar perfil"
            type="submit"
            form="access-profile-form"
            loading={loading}
          />
        </div>
      }
    >
      <AccessProfileForm
        onSubmit={handleSubmit}
        isLoading={loading}
        initialData={profile}
      />
    </Drawer>
  );
}
