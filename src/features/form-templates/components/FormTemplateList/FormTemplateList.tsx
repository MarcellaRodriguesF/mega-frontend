"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";

import {
  FormTemplateStatus,
  FormTemplateStatusColor,
  FormTemplateStatusLabel,
} from "@/constants/enums/templates/form-template-status.enum";
import type { FormTemplateSummary } from "@/services/api/form-templates/form-templates.types";
import { formatUpdatedAt } from "@/features/templates/template-utils";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

interface FormTemplateListProps {
  formTemplates: FormTemplateSummary[];
  isLoading: boolean;
}

export default function FormTemplateList({
  formTemplates,
  isLoading,
}: FormTemplateListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | FormTemplateStatus>("");

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return formTemplates.filter((formTemplate) => {
      if (status && formTemplate.status !== status) return false;
      if (!normalizedSearch) return true;

      return [formTemplate.name, formTemplate.description ?? ""].some((field) =>
        normalizeText(field).includes(normalizedSearch)
      );
    });
  }, [formTemplates, search, status]);

  return (
    <DataTable<FormTemplateSummary>
      columns={[
        {
          key: "name",
          header: "Nome",
          sortable: true,
          mobileRole: "title",
          render: (formTemplate) => formTemplate.name,
        },
        {
          key: "description",
          header: "Descrição",
          render: (formTemplate) => formTemplate.description || "—",
        },
        {
          key: "fieldCount",
          header: "Campos",
          sortable: true,
          render: (formTemplate) => formTemplate.fieldCount,
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          mobileRole: "status",
          render: (formTemplate) => (
            <StatusBadge
              label={FormTemplateStatusLabel(formTemplate.status)}
              color={FormTemplateStatusColor(formTemplate.status)}
            />
          ),
        },
        {
          key: "updatedAt",
          header: "Atualizado em",
          sortable: true,
          render: (formTemplate) => formatUpdatedAt(formTemplate.updatedAt),
        },
      ]}
      data={filtered}
      getRowKey={(formTemplate) => formTemplate.id}
      isLoading={isLoading}
      emptyMessage={
        search || status
          ? "Nenhum formulário encontrado para essa busca."
          : "Nenhum formulário cadastrado."
      }
      searchPlaceholder="Buscar por nome ou descrição..."
      searchValue={search}
      onSearchChange={setSearch}
      onRowClick={(formTemplate) =>
        router.push(`/form-templates/${formTemplate.id}`)
      }
      filters={[
        {
          id: "status",
          label: "Status",
          value: status,
          onChange: (value) => setStatus(value as "" | FormTemplateStatus),
          options: [
            { value: "", label: "Todos" },
            { value: FormTemplateStatus.ACTIVE, label: "Ativo" },
            { value: FormTemplateStatus.INACTIVE, label: "Inativo" },
          ],
        },
      ]}
    />
  );
}
