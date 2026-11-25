"use client";

import { useEffect, useRef, useState } from "react";
import { Funnel } from "@phosphor-icons/react";

import Button from "@/components/ui/Button/Button";

import styles from "./TableFilters.module.css";

export interface TableFilterOption {
  value: string;
  label: string;
}

export interface TableFilterGroup {
  id: string;
  label: string;
  value: string;
  options: TableFilterOption[];
  onChange: (value: string) => void;
}

interface TableFiltersProps {
  groups: TableFilterGroup[];
}

export default function TableFilters({ groups }: TableFiltersProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = groups.flatMap((group) => {
    const option = group.options.find((item) => item.value === group.value && item.value !== "");
    return option ? [option.label] : [];
  });

  const label =
    selected.length === 0
      ? "Filtros"
      : selected.length === 1
        ? `Filtros: ${selected[0]}`
        : `Filtros: ${selected.length}`;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (groups.length === 0) return null;

  return (
    <div className={styles.filters} ref={rootRef}>
      <Button
        variant="secondary"
        text={
          <span className={styles.filterLabel}>
            <Funnel size={16} />
            {label}
          </span>
        }
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      />

      {open ? (
        <div className={styles.filterMenu} role="menu">
          {groups.map((group) => (
            <div key={group.id} className={styles.group}>
              <span className={styles.filterTitle}>{group.label}</span>
              {group.options.map((option) => {
                const active = group.value === option.value;

                return (
                  <button
                    key={`${group.id}-${option.value || "all"}`}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    className={active ? styles.filterOptionActive : styles.filterOption}
                    onClick={() => {
                      group.onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
