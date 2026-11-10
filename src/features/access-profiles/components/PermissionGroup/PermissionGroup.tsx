"use client";

import { useMemo, useState } from "react";

import type { Permission } from "@/services/api/access-profiles/access-profiles.types";

import styles from "./PermissionGroup.module.css";

interface PermissionGroupProps {
  permissions: Permission[];
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
}

interface PermissionModule {
  key: string;
  label: string;
  permissions: Permission[];
}

const MODULE_LABELS: Record<string, string> = {
  DASHBOARD: "Dashboard",
  CLIENTS: "Clientes",
  UNITS: "Usinas",
  IMPLEMENTATIONS: "Implantações",
  ACTIVITIES: "Atividades",
  PROVIDERS: "Provedores",
  TECHNICIANS: "Técnicos",
  OCCURRENCES: "Ocorrências",
  REPORTS: "Relatórios",
  SETTINGS: "Configurações",
  USERS: "Usuários",
  ACCESS_PROFILES: "Perfis de acesso",
};

function getModuleLabel(module: string) {
  return (
    MODULE_LABELS[module] ??
    module
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function PermissionToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`${styles.toggle} ${checked ? styles.toggleActive : ""}`}
      onClick={onChange}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

export default function PermissionGroup({
  permissions,
  selectedCodes,
  onChange,
}: PermissionGroupProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);

  const modules = useMemo<PermissionModule[]>(() => {
    const grouped = permissions.reduce<Record<string, Permission[]>>(
      (accumulator, permission) => {
        const module = permission.module || "OTHER";

        if (!accumulator[module]) {
          accumulator[module] = [];
        }

        accumulator[module].push(permission);

        return accumulator;
      },
      {},
    );

    return Object.entries(grouped)
      .map(([key, modulePermissions]) => ({
        key,
        label: getModuleLabel(key),
        permissions: modulePermissions.sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR"),
        ),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [permissions]);

  const totalSelected = selectedCodes.length;
  const totalPermissions = permissions.length;

  function toggleModuleExpansion(moduleKey: string) {
    setExpandedModules((current) =>
      current.includes(moduleKey)
        ? current.filter((key) => key !== moduleKey)
        : [...current, moduleKey],
    );
  }

  function toggleModule(module: PermissionModule) {
    const moduleCodes = module.permissions.map((permission) => permission.code);

    const allSelected = moduleCodes.every((code) => selectedSet.has(code));

    if (allSelected) {
      onChange(selectedCodes.filter((code) => !moduleCodes.includes(code)));
      return;
    }

    onChange(Array.from(new Set([...selectedCodes, ...moduleCodes])));
  }

  function togglePermission(permissionCode: string) {
    if (selectedSet.has(permissionCode)) {
      onChange(selectedCodes.filter((code) => code !== permissionCode));
      return;
    }

    onChange([...selectedCodes, permissionCode]);
  }

  function clearSelection() {
    onChange([]);
  }

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <span>
          <strong>{totalSelected}</strong> de {totalPermissions} permissões
          selecionadas
        </span>

        <button
          type="button"
          className={styles.clearButton}
          onClick={clearSelection}
          disabled={totalSelected === 0}
        >
          Limpar seleção
        </button>
      </div>

      <div className={styles.moduleList}>
        {modules.map((module) => {
          const moduleCodes = module.permissions.map(
            (permission) => permission.code,
          );

          const selectedCount = moduleCodes.filter((code) =>
            selectedSet.has(code),
          ).length;

          const allSelected = selectedCount === module.permissions.length;

          const partiallySelected = selectedCount > 0 && !allSelected;

          const isExpanded = expandedModules.includes(module.key);

          return (
            <section key={module.key} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <button
                  type="button"
                  className={styles.expandButton}
                  onClick={() => toggleModuleExpansion(module.key)}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? `Recolher ${module.label}`
                      : `Expandir ${module.label}`
                  }
                >
                  <span
                    className={`${styles.chevron} ${
                      isExpanded ? styles.chevronExpanded : ""
                    }`}
                  />
                </button>

                <button
                  type="button"
                  className={styles.moduleInfo}
                  onClick={() => toggleModuleExpansion(module.key)}
                  aria-expanded={isExpanded}
                >
                  <span className={styles.moduleName}>{module.label}</span>

                  <span className={styles.moduleDescription}>
                    {selectedCount} de {module.permissions.length}{" "}
                    {module.permissions.length === 1
                      ? "permissão selecionada"
                      : "permissões selecionadas"}
                  </span>
                </button>

                <div className={styles.moduleControl}>
                  {partiallySelected && (
                    <span className={styles.partialIndicator}>Parcial</span>
                  )}

                  <PermissionToggle
                    checked={allSelected}
                    onChange={() => toggleModule(module)}
                    label={`Ativar todas as permissões de ${module.label}`}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className={styles.permissionList}>
                  {module.permissions.map((permission) => {
                    const isSelected = selectedSet.has(permission.code);

                    return (
                      <div
                        key={permission.id}
                        className={styles.permissionItem}
                      >
                        <div className={styles.permissionInfo}>
                          <span className={styles.permissionName}>
                            {permission.name}
                          </span>

                          {permission.description && (
                            <span className={styles.permissionDescription}>
                              {permission.description}
                            </span>
                          )}
                        </div>

                        <PermissionToggle
                          checked={isSelected}
                          onChange={() => togglePermission(permission.code)}
                          label={`Ativar ${permission.name}`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
