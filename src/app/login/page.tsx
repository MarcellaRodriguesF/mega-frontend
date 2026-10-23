import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import Input from "@/components/ui/Input/Input";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Acesso",
};

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <div className={styles.loginContent}>
        <div className={styles.loginHeader}>
          <Link
            className={styles.brand}
            href="/login"
            aria-label="MEGA, página de acesso"
          >
            <Image
              src="/logo.svg"
              alt="MEGA Soluções Telecom"
              width={120}
              height={116}
              priority
            />
          </Link>
          <ThemeToggle />
        </div>
        <Card className={styles.loginCard}>
          <Badge status="neutral">Primeira entrega</Badge>
          <h1>Acesso à plataforma</h1>
          <p className={styles.description}>
            A autenticação será habilitada em uma próxima etapa do projeto.
          </p>
          <div className={styles.formPreview}>
            <Input
              label="E-mail"
              type="email"
              placeholder="nome@empresa.com"
              disabled
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              disabled
            />
            <Button disabled>Disponível em breve</Button>
          </div>
        </Card>
        <p className={styles.footer}>MEGA · Plataforma de operação e gestão</p>
      </div>
    </main>
  );
}
