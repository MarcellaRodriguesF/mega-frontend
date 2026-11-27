export const UnitStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type UnitStatus = (typeof UnitStatus)[keyof typeof UnitStatus];

export const UnitStatusLabel: Record<UnitStatus, string> = {
  [UnitStatus.ACTIVE]: "Ativa",
  [UnitStatus.INACTIVE]: "Inativa",
};

export function UnitStatusColor(status: UnitStatus): "green" | "red" {
  switch (status) {
    case UnitStatus.ACTIVE:
      return "green";

    case UnitStatus.INACTIVE:
      return "red";
  }
}
