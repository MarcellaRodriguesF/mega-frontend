import {
  Camera,
  ChatCircle,
  ClipboardText,
  Hash,
  Notebook,
  Percent,
  SealCheck,
} from "@phosphor-icons/react";

import { ActivityRequirementTypeLabel } from "@/constants/enums/templates/activity-requirement-type.enum";
import type { ActivityRequirement } from "@/services/api/templates/templates.types";

import styles from "./RequirementIndicators.module.css";

const INDICATORS = [
  { type: "EVIDENCE", label: "Evidência", Icon: Camera },
  { type: "FORM", label: "Formulário", Icon: ClipboardText },
  { type: "QUANTITY", label: "Quantidade", Icon: Hash },
  { type: "COMMENT", label: "Comentário", Icon: ChatCircle },
  { type: "ENGINEER_APPROVAL", label: "Engenheiro", Icon: SealCheck },
  { type: "DAILY_REPORT", label: "Diário", Icon: Notebook },
  { type: "COMPLETION_PERCENTAGE", label: "Percentual", Icon: Percent },
] as const;

interface RequirementIndicatorsProps {
  requirements: ActivityRequirement[];
}

export default function RequirementIndicators({
  requirements,
}: RequirementIndicatorsProps) {
  const configured = new Map<string, boolean>();

  for (const requirement of requirements) {
    configured.set(
      requirement.type,
      Boolean(configured.get(requirement.type) || requirement.isRequired),
    );
  }

  const visible = INDICATORS.filter((indicator) => configured.has(indicator.type));

  if (visible.length === 0) return null;

  return (
    <div className={styles.list}>
      {visible.map((indicator) => {
        const required = configured.get(indicator.type);
        const title = `${ActivityRequirementTypeLabel(indicator.type)}${
          required ? " obrigatório" : " opcional"
        }`;

        return (
          <span className={styles.indicator} key={indicator.type} title={title}>
            <indicator.Icon size={14} aria-hidden="true" />
            {indicator.label}
          </span>
        );
      })}
    </div>
  );
}
