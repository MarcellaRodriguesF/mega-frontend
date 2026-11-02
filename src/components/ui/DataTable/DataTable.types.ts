import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  hideOnMobile?: boolean;
  sortable?: boolean;
  mobileRole?: "title" | "status" | "full" | "default";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;

  title?: string;
  description?: string;

  isLoading?: boolean;
  emptyMessage?: string;

  actions?: (item: T) => ReactNode;

  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  toolbar?: ReactNode;

  pagination?: boolean;
  pageSizeOptions?: number[];
}
