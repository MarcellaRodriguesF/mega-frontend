import type { SelectHTMLAttributes } from "react";
import classNames from "classnames";
import { CaretDown } from "@phosphor-icons/react";
import FormMessage from "../FormMessage/FormMessage";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export default function Select({
  label,
  options,
  placeholder = "Selecione uma opção",
  error,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  const classes = classNames(styles.select, className, {
    [styles.selectError]: Boolean(error),
  });

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={selectId}>
        {label}
      </label>

      <div className={styles.selectWrapper}>
        <select
          id={selectId}
          className={classes}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <CaretDown className={styles.icon} size={18} weight="regular" />
      </div>

      <FormMessage
        message={error ?? ""}
        id={error ? `${selectId}-error` : undefined}
      />
    </div>
  );
}
