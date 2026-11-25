import Link from "next/link";

import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { ActivityRequirementTypeLabel } from "@/constants/enums/templates/activity-requirement-type.enum";
import {
  ImplementationWorkStatusColor,
  ImplementationWorkStatusLabel,
} from "@/constants/enums/implementations/implementation-work-status.enum";
import type {
  ImplementationActivity,
  ImplementationDetail,
} from "@/services/api/implementations/implementations.types";

import styles from "./ImplementationStructure.module.css";

const assignmentRoleLabel = {
  EXECUTOR: "Executor",
  SUPERVISOR: "Supervisor",
} as const;

function ActivityCard({ activity }: { activity: ImplementationActivity }) {
  return (
    <li>
      <div className={styles.activityHeader}>
        <strong>
          <Link href={`/activities/${activity.id}`}>{activity.name}</Link>
        </strong>
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
      {activity.formSnapshots.map((form) => (
        <p className={styles.meta} key={form.id}>
          Formulário da atividade: {form.name} · {form.fields.length} campo(s)
        </p>
      ))}
    </li>
  );
}

interface ImplementationStructureProps {
  implementation: ImplementationDetail;
}

export default function ImplementationStructure({
  implementation,
}: ImplementationStructureProps) {
  const templateName = implementation.template?.name;

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2>Atividades diretas</h2>
          <p>Atividades deste processo que ainda não estão dentro de uma etapa.</p>
        </header>
        {implementation.directActivities.length === 0 ? (
          <p className={styles.meta}>Nenhuma atividade direta.</p>
        ) : (
          <ul className={styles.activities}>
            {implementation.directActivities.map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2>Etapas</h2>
          <p>
            {templateName
              ? `A cópia inicial veio do template ${templateName}. Alterações posteriores no template não modificam este processo.`
              : "Este processo foi criado sem template. As etapas e atividades podem ser incluídas aqui."}
          </p>
        </header>

        {implementation.stages.length === 0 ? (
          <p className={styles.meta}>Nenhuma etapa.</p>
        ) : (
          implementation.stages.map((stage, stageIndex) => (
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
                {stage.activities.length === 0 ? (
                  <li>
                    <p className={styles.meta}>Nenhuma atividade nesta etapa.</p>
                  </li>
                ) : (
                  stage.activities.map((activity) => (
                    <ActivityCard activity={activity} key={activity.id} />
                  ))
                )}
              </ul>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
