import type { ReactNode } from "react";
import styles from "./List.module.css";

interface ListItemData {
  title: ReactNode;
  subtitle: ReactNode;
  description: ReactNode;
}

interface ListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  getItem: (item: T) => ListItemData;
  renderActions?: (item: T) => ReactNode;
  onItemClick?: (item: T) => void;
  isLoading?: boolean;
}

export function List<T>({
  items,
  keyExtractor,
  getItem,
  renderActions,
  onItemClick,
  isLoading = false,
}: ListProps<T>) {
  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.state}>Carregando...</div>
      ) : items.length === 0 ? (
        <div className={styles.state}>Nenhum registro encontrado.</div>
      ) : (
        <div className={styles.items}>
          {items.map((item) => {
            const { title, subtitle, description } = getItem(item);

            return (
              <div
                key={keyExtractor(item)}
                className={`${styles.item} ${onItemClick ? styles.clickable : ""}`}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
                onKeyDown={
                  onItemClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onItemClick(item);
                        }
                      }
                    : undefined
                }
                role={onItemClick ? "button" : undefined}
                tabIndex={onItemClick ? 0 : undefined}
              >
                <div className={styles.content}>
                  <strong className={styles.title}>{title}</strong>
                  <span className={styles.subtitle}>{subtitle}</span>
                  <span className={styles.description}>{description}</span>
                </div>

                {renderActions && (
                  <div
                    className={styles.actions}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {renderActions(item)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
