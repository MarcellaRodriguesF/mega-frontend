"use client";

import Select from "@/components/ui/Select/Select";
import {
  ImplementationStatus,
  ImplementationStatusLabel,
} from "@/constants/enums/implementations/implementation-status.enum";

import styles from "./ImplementationFilters.module.css";

interface Option {
  id: string;
  label: string;
}

interface ImplementationFiltersProps {
  companyId: string;
  unitId: string;
  status: string;
  companies: Option[];
  units: Option[];
  onCompanyChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function ImplementationFilters({
  companyId,
  unitId,
  status,
  companies,
  units,
  onCompanyChange,
  onUnitChange,
  onStatusChange,
}: ImplementationFiltersProps) {
  const companyValue = companyId || "all";
  const unitValue = unitId || "all";
  const statusValue = status || "all";

  return (
    <div className={styles.filters}>
      <Select
        label="Cliente"
        value={companyValue}
        options={[
          { value: "all", label: "Todos os clientes" },
          ...companies.map((company) => ({
            value: company.id,
            label: company.label,
          })),
        ]}
        onChange={(event) =>
          onCompanyChange(event.target.value === "all" ? "" : event.target.value)
        }
      />
      <Select
        label="Unidade"
        value={unitValue}
        options={[
          { value: "all", label: "Todas as unidades" },
          ...units.map((unit) => ({
            value: unit.id,
            label: unit.label,
          })),
        ]}
        onChange={(event) =>
          onUnitChange(event.target.value === "all" ? "" : event.target.value)
        }
      />
      <Select
        label="Status"
        value={statusValue}
        options={[
          { value: "all", label: "Todos os status" },
          ...Object.values(ImplementationStatus).map((value) => ({
            value,
            label: ImplementationStatusLabel(value),
          })),
        ]}
        onChange={(event) =>
          onStatusChange(event.target.value === "all" ? "" : event.target.value)
        }
      />
    </div>
  );
}
