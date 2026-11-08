"use client";

import { FileText, Info } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import PageState from "@/components/ui/PageState/PageState";

import styles from "./CompanyDocumentsPage.module.css";

export default function CompanyDocumentsPage() {
  return (
    <section className={styles.container}>
      <PageState
        type="empty"
        title="Nenhum documento cadastrado"
        description="A funcionalidade será definida após a validação dos requisitos com a Mega."
      />{" "}
      <Card title="Gestão de documentos" icon={<FileText size={20} />}>
        <div className={styles.notice}>
          <Info size={18} />

          <span>Funcionalidade em validação</span>
        </div>

        <p className={styles.description}>
          Esta área tem como objetivo centralizar os documentos relacionados às
          empresas e aos seus processos, facilitando o armazenamento, a
          organização e a consulta de arquivos dentro da plataforma.
        </p>

        <p className={styles.description}>
          Entre as possibilidades estão contratos, propostas comerciais,
          documentos cadastrais, projetos técnicos, relatórios e outros arquivos
          relevantes para a operação.
        </p>

        <div className={styles.validation}>
          <strong>Validação com a Mega</strong>

          <p>
            A Mega considera importante ter uma área para armazenamento e
            consulta de documentos? Quais tipos de arquivos precisam ser
            gerenciados e a quais processos ou cadastros eles devem estar
            vinculados?
          </p>
        </div>
      </Card>
    </section>
  );
}
