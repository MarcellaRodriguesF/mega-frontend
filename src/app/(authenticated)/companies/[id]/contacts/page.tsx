'use client';
import PageState from "@/components/ui/PageState/PageState";

export default function CompanyDocumentsPage() {
  return (
    <section>
      <PageState
        type="empty"
        title="Nenhum contato cadastrado"
        description="Os contatos vinculados a esta empresa serão exibidos aqui."
      />
    </section>
  );
}
