"use client";

import { useId, useState, type ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react";
import PageState from "@/components/ui/PageState/PageState";
import styles from "./AccordionList.module.css";

export interface AccordionListProps<T> {
  items: readonly T[];
  getItemId: (item: T) => string;
  renderHeader: (item: T, expanded: boolean) => ReactNode;
  renderContent: (item: T) => ReactNode;
  renderActions?: (item: T) => ReactNode;
  defaultExpandedIds?: readonly string[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function AccordionList<T>({
  items,
  getItemId,
  renderHeader,
  renderContent,
  renderActions,
  defaultExpandedIds = [],
  emptyMessage = "Nenhum registro encontrado.",
  isLoading = false,
}: AccordionListProps<T>) {
  const instanceId = useId().replace(/:/g, "");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds),
  );

  function toggle(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (isLoading) return <PageState type="loading" />;
  if (items.length === 0) return <PageState type="empty" title={emptyMessage} />;

  return (
    <div className={styles.list}>
      {items.map((item) => {
        const id = getItemId(item);
        const expanded = expandedIds.has(id);
        const safeId = encodeURIComponent(id);
        const panelId = `${instanceId}-accordion-panel-${safeId}`;
        const headerId = `${instanceId}-accordion-header-${safeId}`;

        return (
          <article className={styles.item} key={id}>
            <div className={styles.header}>
              <button
                className={styles.toggle}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                aria-label={expanded ? "Recolher item" : "Expandir item"}
                onClick={() => toggle(id)}
              >
                <CaretDown
                  className={`${styles.caret} ${expanded ? styles.expanded : ""}`}
                  size={18}
                  aria-hidden="true"
                />
              </button>
              <div id={headerId} className={styles.headerContent}>
                {renderHeader(item, expanded)}
              </div>
              {renderActions ? (
                <div className={styles.actions}>{renderActions(item)}</div>
              ) : null}
            </div>
            {expanded ? (
              <div
                id={panelId}
                className={styles.panel}
                role="region"
                aria-labelledby={headerId}
              >
                {renderContent(item)}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
