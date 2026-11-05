"use client";
import PageState from "@/components/ui/PageState/PageState";

export default function CompanyDocumentsPage() {
  return (
    <section>
      <PageState
        type="empty"
        title="Nenhuma oportunidade cadastrada"
        description="As oportunidades vinculadas a esta empresa serão exibidas aqui."
      />
    </section>
  );
}
