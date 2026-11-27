"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";

import {
  TemplateStatus,
  TemplateStatusColor,
  TemplateStatusLabel,
} from "@/constants/enums/templates/template-status.enum";
import type { TemplateSummary } from "@/services/api/templates/templates.types";
import { formatUpdatedAt } from "../../template-utils";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

interface TemplateListProps {
  templates: TemplateSummary[];
  isLoading: boolean;
}

export default function TemplateList({
  templates,
  isLoading,
}: TemplateListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | TemplateStatus>("");

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return templates.filter((template) => {
      if (status && template.status !== status) return false;
      if (!normalizedSearch) return true;

      return [
        template.name,
        template.description ?? "",
        TemplateStatusLabel(template.status),
      ].some((field) => normalizeText(field).includes(normalizedSearch));
    });
  }, [templates, search, status]);

  return (
    <DataTable<TemplateSummary>
      columns={[
        {
          key: "name",
          header: "Nome",
          sortable: true,
          mobileRole: "title",
          render: (template) => template.name,
        },
        {
          key: "description",
          header: "Descrição",
          render: (template) => template.description || "—",
        },
        {
          key: "stageCount",
          header: "Etapas",
          sortable: true,
          render: (template) => template.stageCount,
        },
        {
          key: "activityCount",
          header: "Atividades",
          sortable: true,
          render: (template) => template.activityCount,
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          mobileRole: "status",
          render: (template) => (
            <StatusBadge
              label={TemplateStatusLabel(template.status)}
              color={TemplateStatusColor(template.status)}
            />
          ),
        },
        {
          key: "updatedAt",
          header: "Atualizado em",
          sortable: true,
          render: (template) => formatUpdatedAt(template.updatedAt),
        },
      ]}
      data={filteredTemplates}
      getRowKey={(template) => template.id}
      isLoading={isLoading}
      emptyMessage={
        search || status
          ? "Nenhum template encontrado para essa busca."
          : "Nenhum template cadastrado."
      }
      searchPlaceholder="Buscar por nome ou descrição..."
      searchValue={search}
      onSearchChange={setSearch}
      onRowClick={(template) => router.push(`/templates/${template.id}`)}
      filters={[
        {
          id: "status",
          label: "Status",
          value: status,
          onChange: (value) => setStatus(value as "" | TemplateStatus),
          options: [
            { value: "", label: "Todos" },
            { value: TemplateStatus.DRAFT, label: "Rascunho" },
            { value: TemplateStatus.PUBLISHED, label: "Publicado" },
            { value: TemplateStatus.ARCHIVED, label: "Arquivado" },
          ],
        },
      ]}
    />
  );
}
