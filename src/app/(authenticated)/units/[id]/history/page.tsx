"use client";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";

export default function UnitHistoryPage() {
  return (
    <section>
      <PageHeader
        title="Histórico da unidade"
        description="Movimentações rastreáveis relacionadas à unidade."
      />
      <PageState
        type="empty"
        title="Histórico ainda indisponível"
        description="O backend ainda não possui um registro de auditoria de negócio associado à unidade. Esta aba será preenchida quando essa estrutura estiver definida e disponível."
      />
    </section>
  );
}
