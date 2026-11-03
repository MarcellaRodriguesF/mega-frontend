import type { ReactNode } from "react";

import {
  CircleNotch,
  MagnifyingGlass,
  LockKey,
  WarningCircle,
  FolderOpen,
} from "@phosphor-icons/react";

import Button from "@/components/ui/Button/Button";

import styles from "./PageState.module.css";
import MegaLoader from "../MegaLoader/MegaLoader";

export type PageStateType =
  | "loading"
  | "empty"
  | "not-found"
  | "forbidden"
  | "error";

interface PageStateProps {
  type: PageStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

const defaultContent = {
  loading: {
    title: "Carregando...",
    description: "Aguarde enquanto buscamos as informações.",
  },
  empty: {
    title: "Nenhum registro encontrado",
    description: "Ainda não existem registros para exibir.",
  },
  "not-found": {
    title: "Registro não encontrado",
    description: "Não encontramos o conteúdo que você está procurando.",
  },
  forbidden: {
    title: "Acesso não permitido",
    description: "Você não possui permissão para acessar este conteúdo.",
  },
  error: {
    title: "Não foi possível carregar",
    description: "Ocorreu um erro ao buscar as informações. Tente novamente.",
  },
};

const defaultIcons = {
  loading: CircleNotch,
  empty: FolderOpen,
  "not-found": MagnifyingGlass,
  forbidden: LockKey,
  error: WarningCircle,
};

export default function PageState({
  type,
  title,
  description,
  action,
  icon,
}: PageStateProps) {
  const content = defaultContent[type];
  const DefaultIcon = defaultIcons[type];

  return (
    <div
      className={styles.container}
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className={styles.icon}>
        {icon ? (
          <DefaultIcon size={36} weight="light" />
        ) : type === "loading" ? (
          <MegaLoader />
        ) : (
          <DefaultIcon size={36} weight="light" />
        )}
      </div>

      <div className={styles.text}>
        <h2>{title ?? content.title}</h2>
        <p>{description ?? content.description}</p>
      </div>

      {action && <Button text={action.label} onClick={action.onClick} />}
    </div>
  );
}
