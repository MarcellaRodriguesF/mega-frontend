"use client";

import { useEffect, useState } from "react";

import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  ArrowsDownUp,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";

import type { DataTableProps } from "./DataTable.types";

import DataTableMobile from "./DataTableMobile";

import styles from "./DataTable.module.css";

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  emptyMessage = "Nenhum registro encontrado.",
  actions,
  onRowClick,
  searchPlaceholder = "Buscar registros...",
  searchValue,
  onSearchChange,
  toolbar,
  pagination = true,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] ?? 10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  function handleSort(key: string) {
    setSortConfig((current) => {
      if (current?.key !== key) {
        return { key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }

      return null;
    });

    setCurrentPage(1);
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const recordA = a as Record<string, unknown>;
    const recordB = b as Record<string, unknown>;

    const comparison = String(recordA[sortConfig.key] ?? "").localeCompare(
      String(recordB[sortConfig.key] ?? ""),
      "pt-BR",
      {
        numeric: true,
        sensitivity: "base",
      },
    );

    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  const paginatedData = pagination
    ? sortedData.slice(startIndex, endIndex)
    : sortedData;

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  function changePage(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  function changePageSize(size: number) {
    setPageSize(size);
    setCurrentPage(1);
  }

  function handleRowClick(
    event: React.MouseEvent<HTMLTableRowElement>,
    item: T,
  ) {
    if (!onRowClick) return;

    const target = event.target as HTMLElement;

    if (target.closest("button, a, input, select, textarea, [role='button']")) {
      return;
    }

    onRowClick(item);
  }

  const renderToolbar = () => {
    if (!onSearchChange && !toolbar) return null;

    return (
      <div className={styles.toolbar}>
        {onSearchChange && (
          <div className={styles.searchWrapper}>
            <MagnifyingGlass size={18} />

            <input
              type="search"
              className={styles.search}
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(event) => {
                onSearchChange(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        {toolbar && <div className={styles.toolbarActions}>{toolbar}</div>}
      </div>
    );
  };

  return (
    <section className={styles.container}>
      {renderToolbar()}

      {isLoading ? (
        <div className={styles.state}>Carregando registros...</div>
      ) : totalItems === 0 ? (
        <div className={styles.state}>{emptyMessage}</div>
      ) : (
        <>
          <div className={styles.desktopView}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className={styles[column.align ?? "left"]}
                        style={{ width: column.width }}
                      >
                        {column.sortable ? (
                          <button
                            type="button"
                            className={styles.sortButton}
                            onClick={() => handleSort(String(column.key))}
                          >
                            {column.header}

                            {sortConfig?.key === String(column.key) ? (
                              sortConfig.direction === "asc" ? (
                                <CaretUp size={14} />
                              ) : (
                                <CaretDown size={14} />
                              )
                            ) : (
                              <ArrowsDownUp size={14} />
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    ))}

                    {actions && <th className={styles.actionsHeader}>Ações</th>}
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((item) => (
                    <tr
                      key={getRowKey(item)}
                      onClick={
                        onRowClick
                          ? (event) => handleRowClick(event, item)
                          : undefined
                      }
                      onKeyDown={
                        onRowClick
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onRowClick(item);
                              }
                            }
                          : undefined
                      }
                      tabIndex={onRowClick ? 0 : undefined}
                      className={onRowClick ? styles.clickableRow : undefined}
                    >
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={styles[column.align ?? "left"]}
                        >
                          {column.render
                            ? column.render(item)
                            : String(
                                (item as Record<string, unknown>)[
                                  String(column.key)
                                ] ?? "—",
                              )}
                        </td>
                      ))}

                      {actions && (
                        <td className={styles.actionsCell}>{actions(item)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.mobileView}>
            <DataTableMobile
              columns={columns}
              data={paginatedData}
              getRowKey={getRowKey}
              actions={actions}
              onRowClick={onRowClick}
            />
          </div>
        </>
      )}

      {pagination && totalItems > 0 && (
        <footer className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Exibindo {startIndex + 1}–{endIndex} de {totalItems} registros
          </span>

          <div className={styles.paginationControls}>
            <label className={styles.pageSizeLabel}>
              Linhas por página
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(event) => changePageSize(Number(event.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <span className={styles.pageIndicator}>
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              className={styles.paginationButton}
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <CaretLeft size={17} />
            </button>

            <button
              type="button"
              className={styles.paginationButton}
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
            >
              <CaretRight size={17} />
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}
