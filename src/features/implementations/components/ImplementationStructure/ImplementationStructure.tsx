import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { ActivityRequirementTypeLabel } from "@/constants/enums/templates/activity-requirement-type.enum";
import {
  ImplementationWorkStatusColor,
  ImplementationWorkStatusLabel,
} from "@/constants/enums/implementations/implementation-work-status.enum";
import type {
  ImplementationDetail,
} from "@/services/api/implementations/implementations.types";

import styles from "./ImplementationStructure.module.css";

const assignmentRoleLabel = {
  EXECUTION: "Preenchimento",
  COMPLETION: "Conclusão",
} as const;

interface ImplementationStructureProps {
  implementation: ImplementationDetail;
}

export default function ImplementationStructure({
  implementation,
}: ImplementationStructureProps) {
  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2>Estrutura copiada</h2>
          <p>
            Etapas e atividades desta implantação. Alterações posteriores no
            template {implementation.template.name} não modificam esta cópia.
          </p>
        </header>

        {implementation.stages.map((stage, stageIndex) => (
          <article className={styles.stage} key={stage.id}>
            <div className={styles.stageHeader}>
              <div>
                <h3>
                  {stageIndex + 1}. {stage.name}
                </h3>
                {stage.description ? <p>{stage.description}</p> : null}
              </div>
              <StatusBadge
                label={ImplementationWorkStatusLabel(stage.status)}
                color={ImplementationWorkStatusColor(stage.status)}
              />
            </div>

            <ul className={styles.activities}>
              {stage.activities.map((activity) => (
                <li key={activity.id}>
                  <div className={styles.activityHeader}>
                    <strong>{activity.name}</strong>
                    <StatusBadge
                      label={ImplementationWorkStatusLabel(activity.status)}
                      color={ImplementationWorkStatusColor(activity.status)}
                    />
                  </div>
                  {activity.description ? <p>{activity.description}</p> : null}

                  <p className={styles.meta}>
                    {activity.assignments.length === 0
                      ? "Nenhum responsável atribuído."
                      : activity.assignments
                          .map(
                            (assignment) =>
                              `${assignment.userName} (${assignmentRoleLabel[assignment.role]})`,
                          )
                          .join(", ")}
                  </p>

                  {activity.requirements.length > 0 ? (
                    <ul className={styles.requirements}>
                      {activity.requirements.map((requirement) => (
                        <li key={requirement.id}>
                          {ActivityRequirementTypeLabel(requirement.type)}
                          {requirement.isRequired ? " · obrigatório" : " · opcional"}
                          {requirement.formSnapshot
                            ? ` · formulário copiado: ${requirement.formSnapshot.name}`
                            : ""}
                          {requirement.evidenceTypes.length > 0
                            ? ` · evidências: ${requirement.evidenceTypes
                                .map((item) => item.type)
                                .join(", ")}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.meta}>Sem requisitos.</p>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2>Formulários copiados</h2>
          <p>
            A estrutura dos campos foi preservada no momento da criação. O
            preenchimento ainda não está disponível.
          </p>
        </header>

        {implementation.formSnapshots.length === 0 ? (
          <p className={styles.meta}>Nenhum formulário associado a esta implantação.</p>
        ) : (
          implementation.formSnapshots.map((form) => (
            <article className={styles.stage} key={form.id}>
              <h3>{form.name}</h3>
              {form.description ? <p>{form.description}</p> : null}
              <ul className={styles.requirements}>
                {form.fields.map((field) => (
                  <li key={field.id}>
                    {field.label} · {field.type}
                    {field.isRequired ? " · obrigatório" : ""}
                    {field.isSensitive ? " · sensível" : ""}
                    {field.connectivityFieldTarget
                      ? ` · destino: ${field.connectivityFieldTarget}`
                      : ""}
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
