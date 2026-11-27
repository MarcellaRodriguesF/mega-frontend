export const UnitType = {
  PHOTOVOLTAIC_PLANT: "PHOTOVOLTAIC_PLANT",
} as const;

export type UnitType = (typeof UnitType)[keyof typeof UnitType];

export const UnitTypeLabel: Record<UnitType, string> = {
  [UnitType.PHOTOVOLTAIC_PLANT]: "Usina fotovoltaica",
};

const unitTypeDisplayLabels: Record<string, string> = {
  PHOTOVOLTAIC_PLANT: "Usina fotovoltaica",
  USINA_FOTOVOLTAICA: "Usina fotovoltaica",
  SITE_CORPORATIVO: "Site corporativo",
};

export function getUnitTypeLabel(type: string | null | undefined): string {
  if (!type) return "Não informado";

  const label = unitTypeDisplayLabels[type];

  if (label) return label;

  // Evita exibir valores técnicos com underscores
  return type
    .replace(/_/g, " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)\S/g, (character) => character.toLocaleUpperCase("pt-BR"));
}
