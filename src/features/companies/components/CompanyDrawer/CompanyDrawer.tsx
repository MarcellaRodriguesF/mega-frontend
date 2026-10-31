"use client";

import Drawer from "@/components/layout/Drawer/Drawer";
import Button from "@/components/ui/Button/Button";

import CompanyForm from "../CompanyForm/CompanyForm";

import type { CompanyFormData } from "@/features/companies/schemas/company-form.schema";

import styles from "./CompanyDrawer.module.css";

interface CompanyDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export default function CompanyDrawer({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: CompanyDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Nova empresa"
      description="Preencha os dados para cadastrar uma nova empresa."
      footer={
        <div className={styles.actions}>
          <Button
            variant="secondary"
            text="Cancelar"
            onClick={onClose}
            disabled={isLoading}
          />

          <Button
            text="Salvar empresa"
            type="submit"
            form="company-form"
            loading={isLoading}
          />
        </div>
      }
    >
      <CompanyForm onSubmit={onSubmit} isLoading={isLoading} />
    </Drawer>
  );
}
