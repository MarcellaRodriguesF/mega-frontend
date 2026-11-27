import Link from "next/link";
import styles from "./forbidden.module.css";

export default function Forbidden() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <span className={styles.code}>403</span>

        <h1>Acesso negado</h1>

        <p>
          Você não possui permissão para acessar este conteúdo. Entre em contato
          com o administrador caso precise de acesso.
        </p>

        <Link href="/dashboard" className={styles.button}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
