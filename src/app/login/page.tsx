
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./loginForm";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Acesso | MEGA",
};

export default function LoginPage() {
  return (
    <main className={styles.loginPage} data-theme="dark">
      <header className={styles.header}>
        <Link
          href="/login"
          className={styles.brand}
          aria-label="MEGA Soluções Telecom"
        >
          <Image
            src="/logo.svg"
            alt="MEGA Soluções Telecom"
            width={140}
            height={60}
            priority
          />
        </Link>
      </header>

      <div className={styles.loginLayout}>
        <section className={styles.presentation}>
          <div className={styles.presentationContent}>
            <span className={styles.overline}>
              MEGA SOLUÇÕES TELECOM
            </span>

            <h1>
              Gestão e tecnologia
              <span> para sua operação.</span>
            </h1>

            <p className={styles.presentationDescription}>
              Um ambiente integrado para acompanhar e gerenciar as
              operações da MEGA com mais controle, organização e eficiência.
            </p>

            <div className={styles.capabilities}>
              <div className={styles.capability}>
                <span className={styles.capabilityNumber}>01</span>
                <div>
                  <strong>Conectividade</strong>
                  <span>Redes e infraestrutura</span>
                </div>
              </div>

              <div className={styles.capability}>
                <span className={styles.capabilityNumber}>02</span>
                <div>
                  <strong>Monitoramento</strong>
                  <span>Acompanhamento operacional</span>
                </div>
              </div>

              <div className={styles.capability}>
                <span className={styles.capabilityNumber}>03</span>
                <div>
                  <strong>Gestão</strong>
                  <span>Controle e organização</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.presentationFooter}>
            <span className={styles.footerLine} />
            <span>Plataforma interna de gestão e operação.</span>
          </div>

          <div className={styles.decorativeShape} aria-hidden="true">
            <div className={styles.shapeCircle} />
            <div className={styles.shapeCircle} />
            <div className={styles.shapeCircle} />
          </div>
        </section>

        <section className={styles.loginSection}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeading}>
              <span className={styles.loginOverline}>ÁREA RESTRITA</span>
              <h2>Acesse sua conta</h2>
              <p>
                Informe suas credenciais para entrar na plataforma.
              </p>
            </div>

            <LoginForm />

            <div className={styles.loginSecurity}>
              <span className={styles.securityIcon} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3L19 6V11.5C19 16 16 19.5 12 21C8 19.5 5 16 5 11.5V6L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12L11 14L15 10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span>Acesso exclusivo para usuários autorizados.</span>
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.pageFooter}>
        <span>© {new Date().getFullYear()} MEGA Soluções Telecom</span>
        <span>Plataforma interna de gestão e operação</span>
      </footer>
    </main>
  );
}
