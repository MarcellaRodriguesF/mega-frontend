import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./loginForm";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Hub MG | Acesso",
  },
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        <svg
          className={styles.wave}
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255, 255, 255, 0.42)"
            d="M0 210C180 120 340 300 560 250C820 190 980 80 1200 150C1320 188 1390 250 1440 230V520H0V210Z"
          />
          <path
            fill="rgba(255, 255, 255, 0.28)"
            d="M0 300C220 210 400 390 680 320C960 250 1100 180 1440 260V520H0V300Z"
          />
          <path
            fill="rgba(79, 198, 118, 0.28)"
            d="M0 360C260 280 480 450 760 390C1040 330 1220 300 1440 340V520H0V360Z"
          />
        </svg>
      </div>

      <header className={styles.header}>
        <Link href="/login" className={styles.brand}>
          Hub MG
        </Link>
      </header>

      <div className={styles.layout}>
        <section className={styles.hero}>
          <div className={styles.bubbles}>
            <p>Clientes e unidades no mesmo lugar.</p>
            <p>Implantações, atividades e a operação.</p>
            <p>Chamados e histórico, sempre rastreáveis.</p>
          </div>

          <div className={styles.wordmark}>
            <span className={styles.dots} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <div className={styles.mark}>
              <span className={styles.kicker}>Centralize</span>
              <h1>Hub MG</h1>
              <span className={styles.kickerBottom}>a operação</span>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.card}>
            <h2>Acesse sua conta</h2>
            <p className={styles.cardLead}>
              Entre para acompanhar a operação em um único lugar.
            </p>
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
