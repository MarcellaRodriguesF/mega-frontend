"use client";

import { useState } from "react";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import CompanyForm from "../CompanyForm/CompanyForm";

import type { CompanyFormData } from "@/features/companies/schemas/company-form.schema";
import type { Company } from "@/services/api/companies/companies.types";

import styles from "./CompanyDrawer.module.css";

interface CompanyDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => void | Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  company?: Company;
}

export default function CompanyDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  mode = "create",
  company,
}: CompanyDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === "edit";
  const loading = isLoading || isSubmitting;

  async function handleSubmit(data: CompanyFormData) {
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
      title={isEditing ? "Editar empresa" : "Nova empresa"}
      description={
        isEditing
          ? "Atualize os dados cadastrais e o endereço da empresa."
          : "Preencha os dados para cadastrar uma nova empresa."
      }
      footer={
        <div className={styles.actions}>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={onClose}
            disabled={loading}
          />

          <Button
            text={isEditing ? "Salvar alterações" : "Salvar empresa"}
            type="submit"
            form="company-form"
            loading={loading}
          />
        </div>
      }
    >
      <CompanyForm
        onSubmit={handleSubmit}
        isLoading={loading}
        initialData={company}
      />
    </Drawer>
  );
}
