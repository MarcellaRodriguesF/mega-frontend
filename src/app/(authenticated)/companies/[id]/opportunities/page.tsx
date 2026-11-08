"use client";

import { Handshake, Info, Lightbulb, ChartLineUp } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import PageState from "@/components/ui/PageState/PageState";

import styles from "./CompanyOpportunitiesPage.module.css";

export default function CompanyOpportunitiesPage() {
  return (
    <section className={styles.container}>
      {" "}
      <PageState
        type="empty"
        title="Nenhuma oportunidade cadastrada"
        description="Esta funcionalidade é uma proposta de evolução e depende de validação e aprovação para uma possível implementação futura."
      />
      <Card title="Oportunidades comerciais" icon={<Handshake size={20} />}>
        <div className={styles.notice}>
          <Lightbulb size={18} />
          <span>Proposta de evolução — fora do escopo original</span>
        </div>

        <p className={styles.description}>
          Durante a análise dos processos da Mega e dos materiais
          disponibilizados, identifiquei a possibilidade de incluir um módulo
          para gestão de oportunidades comerciais.
        </p>

        <p className={styles.description}>
          A proposta seria permitir o cadastro e acompanhamento de potenciais
          negócios, desde o primeiro contato até o fechamento, registrando
          informações como empresa, solução de interesse, responsável comercial,
          valor estimado, etapa da negociação e histórico de interações.
        </p>

        <div className={styles.proposal}>
          <div className={styles.proposalHeader}>
            <ChartLineUp size={20} />
            <strong>Possíveis benefícios</strong>
          </div>

          <ul>
            <li>Organização das negociações comerciais.</li>
            <li>Acompanhamento das etapas de cada oportunidade.</li>
            <li>Identificação de negócios em andamento.</li>
            <li>Visibilidade sobre valores e previsões comerciais.</li>
          </ul>
        </div>
        <div className={styles.example}>
          <div className={styles.exampleHeader}>
            <div>
              <strong>Exemplo de oportunidade</strong>
              <span>Simulação baseada nas operações da Mega</span>
            </div>

            <span className={styles.exampleBadge}>Simulação</span>
          </div>

          <h3>Implantação de CFTV em múltiplas UFVs</h3>

          <p className={styles.exampleClient}>Cliente: Origo Energia</p>

          <div className={styles.exampleDetails}>
            <div>
              <span>Solução</span>
              <strong>CFTV e segurança eletrônica</strong>
            </div>

            <div>
              <span>Abrangência</span>
              <strong>Múltiplas usinas fotovoltaicas</strong>
            </div>

            <div>
              <span>Valor estimado</span>
              <strong>A definir</strong>
            </div>

            <div>
              <span>Responsável</span>
              <strong>Responsável comercial</strong>
            </div>
          </div>

          <div className={styles.exampleHistory}>
            <strong>Etapas da negociação</strong>

            <ol>
              <li>Identificação da necessidade</li>
              <li>Levantamento técnico</li>
              <li>Elaboração da proposta</li>
              <li>Negociação comercial</li>
              <li>Fechamento do negócio</li>
            </ol>
          </div>

          <p className={styles.exampleDisclaimer}>
            Exemplo ilustrativo de como uma oportunidade poderia ser acompanhada
            antes da contratação. Não representa uma negociação real em
            andamento.
          </p>
        </div>

        <div className={styles.validation}>
          <div className={styles.validationHeader}>
            <Info size={18} />
            <strong>Validação com a Mega</strong>
          </div>

          <p>
            A Mega considera importante ter esse controle dentro da plataforma?
            Como funciona atualmente o acompanhamento das negociações
            comerciais?
          </p>

          <p>
            Caso haja interesse, o escopo funcional e o esforço de
            desenvolvimento deverão ser avaliados para uma possível etapa futura
            do projeto.
          </p>
        </div>
      </Card>
    </section>
  );
}
