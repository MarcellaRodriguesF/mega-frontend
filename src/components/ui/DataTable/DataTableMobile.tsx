"use client";

import type { DataTableColumn } from "./DataTable.types";
import type { ReactNode } from "react";

import styles from "./DataTable.module.css";

interface DataTableMobileProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  actions?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
}

export default function DataTableMobile<T>({
  columns,
  data,
  getRowKey,
  actions,
  onRowClick,
}: DataTableMobileProps<T>) {
  const mobileColumns = columns.filter((column) => !column.hideOnMobile);

  const titleColumn = mobileColumns.find(
    (column) => column.mobileRole === "title",
  );

  const statusColumn = mobileColumns.find(
    (column) => column.mobileRole === "status",
  );

  const contentColumns = mobileColumns.filter(
    (column) => column.mobileRole !== "title" && column.mobileRole !== "status",
  );

  function renderValue(column: DataTableColumn<T>, item: T) {
    return column.render
      ? column.render(item)
      : String((item as Record<string, unknown>)[String(column.key)] ?? "—");
  }

  return (
    <div className={styles.mobileList}>
      {data.map((item) => {
        const statusValue = (item as Record<string, unknown>)[
          String(statusColumn?.key ?? "")
        ];

        const isActive = String(statusValue).toUpperCase() === "ACTIVE";

        return (
          <article
            key={getRowKey(item)}
            className={`${styles.mobileCard} ${
              onRowClick ? styles.clickableRow : ""
            }`}
            onClick={(event) => {
              if (!onRowClick) return;

              const target = event.target as HTMLElement;

              if (
                target.closest(
                  "button, a, input, select, textarea, [role='button']",
                )
              ) {
                return;
              }

              onRowClick(item);
            }}
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
          >
            <div className={styles.mobileCardHeader}>
              {titleColumn && (
                <div className={styles.mobileTitle}>
                  {renderValue(titleColumn, item)}
                </div>
              )}

              {statusColumn && (
                <span
                  className={`${styles.mobileStatus} ${
                    isActive ? styles.mobileStatusActive : ""
                  }`}
                >
                  {renderValue(statusColumn, item)}
                </span>
              )}
            </div>

            {contentColumns.length > 0 && (
              <div className={styles.mobileGrid}>
                {contentColumns.map((column) => (
                  <div
                    key={String(column.key)}
                    className={
                      column.mobileRole === "full"
                        ? styles.mobileFieldFull
                        : styles.mobileField
                    }
                  >
                    <span className={styles.mobileLabel}>{column.header}</span>

                    <span className={styles.mobileValue}>
                      {renderValue(column, item)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {actions && (
              <div className={styles.mobileActions}>{actions(item)}</div>
            )}
          </article>
        );
      })}
    </div>
  );
}
