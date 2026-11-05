import type { ButtonHTMLAttributes } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  XIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";

import styles from "./IconButton.module.css";

export type IconButtonAction =
  | "edit"
  | "delete"
  | "add"
  | "view"
  | "close"
  | "download"
  | "more";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  action: IconButtonAction;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const actionConfig = {
  edit: {
    icon: PencilIcon,
    label: "Editar",
    variant: "default",
  },
  delete: {
    icon: TrashIcon,
    label: "Excluir",
    variant: "default",
  },
  add: {
    icon: PlusIcon,
    label: "Adicionar",
    variant: "primary",
  },
  view: {
    icon: EyeIcon,
    label: "Visualizar",
    variant: "default",
  },
  close: {
    icon: XIcon,
    label: "Fechar",
    variant: "default",
  },
  download: {
    icon: DownloadSimpleIcon,
    label: "Baixar",
    variant: "default",
  },
  more: {
    icon: DotsThreeIcon,
    label: "Mais opções",
    variant: "default",
  },
} as const;

export default function IconButton({
  action,
  size = "md",
  label,
  className,
  type = "button",
  disabled,
  ...props
}: IconButtonProps) {
  const config = actionConfig[action];
  const Icon = config.icon;
  const accessibleLabel = label ?? config.label;

  const classes = [
    styles.button,
    styles[config.variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      disabled={disabled}
      {...props}
    >
      <Icon size={size === "sm" ? 18 : size === "lg" ? 24 : 22} />
    </button>
  );
}
