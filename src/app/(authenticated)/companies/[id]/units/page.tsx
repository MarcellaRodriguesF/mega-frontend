"use client";

import { useCompany } from "@/contexts/CompanyContext";
import CompanyUnitList from "@/features/units/components/CompanyUnitList/CompanyUnitList";

export default function CompanyUnitsPage() {
  const { company } = useCompany();

  return <CompanyUnitList companyId={company.id} />;
}
