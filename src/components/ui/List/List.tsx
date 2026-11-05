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
  isLoading?: boolean;
}

export function List<T>({
  items,
  keyExtractor,
  getItem,
  renderActions,
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
              <div key={keyExtractor(item)} className={styles.item}>
                <div className={styles.content}>
                  <strong className={styles.title}>{title}</strong>

                  <span className={styles.subtitle}>{subtitle}</span>

                  <span className={styles.description}>{description}</span>
                </div>

                {renderActions && (
                  <div className={styles.actions}>{renderActions(item)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
