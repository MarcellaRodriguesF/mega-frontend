import Link from "next/link";
import styles from "./not-found.module.css";
import MegaLoader from "@/components/ui/MegaLoader/MegaLoader";

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <span className={styles.code}>404</span>

        <h1>Página não encontrada</h1>

        <p>
          A página que você está procurando não existe ou foi movida. Verifique
          o endereço ou retorne ao início.
        </p>

        <Link href="/dashboard" className={styles.button}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
