"use client";

import { Headset } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import PageState from "@/components/ui/PageState/PageState";

import styles from "./ProviderTicketsPage.module.css";

export default function ProviderTicketsPage() {
  return (
    <section className={styles.container}>
      <PageState
        type="empty"
        title="Nenhum chamado cadastrado"
        description="Os chamados vinculados a este provedor aparecerão aqui quando o módulo estiver disponível."
      />

      <Card title="Chamados" icon={<Headset size={20} />}>
        <p className={styles.description}>
          Esta área concentra os chamados relacionados ao provedor. O cadastro
          e o acompanhamento dependem do módulo de chamados, que ainda não está
          disponível para este cadastro.
        </p>
      </Card>
    </section>
  );
}
