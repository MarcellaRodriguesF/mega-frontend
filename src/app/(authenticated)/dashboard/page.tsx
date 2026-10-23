import type { Metadata } from "next";
import Badge from "@/components/ui/Badge/Badge";
import Card from "@/components/ui/Card/Card";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Visão geral",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Acompanhe a plataforma MEGA em um só lugar."
      />
      <Card>
        <div className={styles.foundationCard}>
          <div>
            <Badge status="success">Fundação</Badge>
            <h2 className={styles.foundationTitle}>
              Bem-vindo à plataforma MEGA
            </h2>
            <p className={styles.foundationDescription}>
              A estrutura inicial está pronta. As ferramentas de operação e
              gestão serão disponibilizadas nas próximas etapas.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
