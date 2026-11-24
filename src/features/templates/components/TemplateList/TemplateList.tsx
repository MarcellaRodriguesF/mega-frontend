"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import DataTable from "@/components/ui/DataTable/DataTable";
import IconButton from "@/components/ui/IconButton/IconButton";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import Button from "@/components/ui/Button/Button";

import {
  TemplateStatus,
  TemplateStatusColor,
  TemplateStatusLabel,
} from "@/constants/enums/templates/template-status.enum";
import type { TemplateSummary } from "@/services/api/templates/templates.types";
import { formatUpdatedAt } from "../../template-utils";

import styles from "./TemplateList.module.css";

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
  onPublish: (template: TemplateSummary) => void;
  onArchive: (template: TemplateSummary) => void;
}

export default function TemplateList({
  templates,
  isLoading,
  onPublish,
  onArchive,
}: TemplateListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | TemplateStatus>("");

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return templates.filter((template) => {
      if (status && template.status !== status) return false;
      if (!normalizedSearch) return true;

      return [template.name, template.description ?? "", TemplateStatusLabel(template.status)]
        .some((field) => normalizeText(field).includes(normalizedSearch));
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
      toolbar={
        <select
          className={styles.filter}
          aria-label="Filtrar por status"
          value={status}
          onChange={(event) => setStatus(event.target.value as "" | TemplateStatus)}
        >
          <option value="">Todos os status</option>
          <option value={TemplateStatus.DRAFT}>Rascunho</option>
          <option value={TemplateStatus.PUBLISHED}>Publicado</option>
          <option value={TemplateStatus.ARCHIVED}>Arquivado</option>
        </select>
      }
      actions={(template) => (
        <div className={styles.actions}>
          <IconButton
            action="edit"
            size="sm"
            label="Editar template"
            onClick={() => router.push(`/templates/${template.id}`)}
          />
          {template.status !== TemplateStatus.PUBLISHED && (
            <Button
              variant="outline"
              text="Publicar"
              onClick={() => onPublish(template)}
            />
          )}
          {template.status !== TemplateStatus.ARCHIVED && (
            <Button
              variant="secondary"
              text="Arquivar"
              onClick={() => onArchive(template)}
            />
          )}
        </div>
      )}
    />
  );
}
