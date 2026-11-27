"use client";

import type { ReactNode } from "react";

import styles from "./Tabs.module.css";

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={[styles.tabs, className].filter(Boolean).join(" ")}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`tab-${item.value}`}
            aria-selected={isActive}
            aria-controls={`panel-${item.value}`}
            disabled={item.disabled}
            className={`${styles.tab} ${isActive ? styles.active : ""}`}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
