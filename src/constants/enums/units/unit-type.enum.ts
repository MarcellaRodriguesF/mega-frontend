export const UnitType = {
    PHOTOVOLTAIC_PLANT: "PHOTOVOLTAIC_PLANT",
  } as const;
  
  export type UnitType = (typeof UnitType)[keyof typeof UnitType];
  
  export const UnitTypeLabel: Record<UnitType, string> = {
    [UnitType.PHOTOVOLTAIC_PLANT]: "Usina fotovoltaica",
  };