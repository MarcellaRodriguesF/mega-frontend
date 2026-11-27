"use client";

import { useMemo, useState } from "react";
import DataTable from "@/components/ui/DataTable/DataTable";
import IconButton from "@/components/ui/IconButton/IconButton";
import type { TableFilterOption } from "@/components/ui/TableFilters/TableFilters";
import styles from "./DocumentTable.module.css";

export interface DocumentTableItem {
  id: string;
  name: string;
  type: string | null;
  fileName: string;
  mimeType: string | null;
  createdAt: string;
  unitId?: string | null;
  unitName?: string | null;
}

interface DocumentTableProps {
  documents: DocumentTableItem[];
  isLoading?: boolean;
  unitOptions?: TableFilterOption[];
  onView: (document: DocumentTableItem) => void;
  onDownload: (document: DocumentTableItem) => void;
  onEdit: (document: DocumentTableItem) => void;
  onDelete: (document: DocumentTableItem) => void;
}

const NO_TYPE = "__no_type__";
const NO_UNIT = "__no_unit__";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function DocumentTable({
  documents,
  isLoading = false,
  unitOptions,
  onView,
  onDownload,
  onEdit,
  onDelete,
}: DocumentTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");

  const types = useMemo(
    () =>
      [
        ...new Set(documents.map((document) => document.type).filter(Boolean)),
      ].sort((a, b) => a!.localeCompare(b!, "pt-BR")),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const query = normalize(search);

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        normalize(document.name).includes(query) ||
        normalize(document.fileName).includes(query);

      const matchesType =
        !typeFilter ||
        (typeFilter === NO_TYPE
          ? !document.type
          : document.type === typeFilter);

      const matchesUnit =
        !unitFilter ||
        (unitFilter === NO_UNIT
          ? !document.unitId
          : document.unitId === unitFilter);

      return matchesSearch && matchesType && matchesUnit;
    });
  }, [documents, search, typeFilter, unitFilter]);

  const filters = [
    {
      id: "type",
      label: "Tipo",
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: "", label: "Todos os tipos" },
        ...types.map((type) => ({ value: type!, label: type! })),
        { value: NO_TYPE, label: "Sem tipo" },
      ],
    },
    ...(unitOptions
      ? [
          {
            id: "unit",
            label: "Unidade",
            value: unitFilter,
            onChange: setUnitFilter,
            options: [
              { value: "", label: "Todas as unidades" },
              ...unitOptions,
              { value: NO_UNIT, label: "Sem unidade" },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className={styles.tableContainer}>
      <DataTable<DocumentTableItem>
        columns={[
          {
            key: "name",
            header: "Documento",
            width: "40%",
            sortable: true,
            mobileRole: "title",
            render: (document) => (
              <span className={styles.documentName}>
                <strong>{document.name}</strong>
                <small>{document.fileName}</small>
              </span>
            ),
          },
          {
            key: "type",
            header: "Tipo",
            width: "18%",
            sortable: true,
            render: (document) => document.type || "—",
          },
          {
            key: "unitName",
            header: "Unidade",
            width: "20%",
            sortable: true,
            render: (document) => document.unitName || "—",
          },
          {
            key: "createdAt",
            header: "Data do upload",
            width: "16%",
            sortable: true,
            render: (document) => formatDate(document.createdAt),
          },
        ]}
        data={filteredDocuments}
        getRowKey={(document) => document.id}
        isLoading={isLoading}
        emptyMessage="Nenhum documento encontrado."
        searchPlaceholder="Buscar por nome do documento..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        actions={(document) => (
          <div className={styles.actions}>
            <IconButton
              action="view"
              size="sm"
              label={`Visualizar ${document.name}`}
              onClick={() => onView(document)}
            />
            <IconButton
              action="download"
              size="sm"
              label={`Baixar ${document.name}`}
              onClick={() => onDownload(document)}
            />
            <IconButton
              action="edit"
              size="sm"
              label={`Editar ${document.name}`}
              onClick={() => onEdit(document)}
            />
            <IconButton
              action="delete"
              size="sm"
              label={`Excluir ${document.name}`}
              onClick={() => onDelete(document)}
            />
          </div>
        )}
      />
    </div>
  );
}
