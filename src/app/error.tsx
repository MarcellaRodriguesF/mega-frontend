"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Erro inesperado na aplicação:", error);
  }, [error]);

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <span className={styles.code}>500</span>

        <h1>Algo deu errado</h1>

        <p>
          Ocorreu um erro inesperado ao processar sua solicitação. Tente
          novamente. Se o problema persistir, entre em contato com o suporte.
        </p>

        <button type="button" className={styles.button} onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
