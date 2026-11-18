import Button from "@/components/ui/Button/Button";
import styles from "./FormActions.module.css";

interface FormActionsProps {
  formId: string;
  onCancel: () => void;
  isDirty: boolean;
  isSaving?: boolean;
  saveText?: string;
  cancelText?: string;
  disabled?: boolean;
}

export default function FormActions({
  formId,
  onCancel,
  isDirty,
  isSaving = false,
  saveText = "Salvar alterações",
  cancelText = "Cancelar",
  disabled = false,
}: FormActionsProps) {
  return (
    <div className={styles.container}>
      <span className={styles.message}>
        {isDirty
          ? "Você tem alterações não salvas."
          : "Todas as alterações estão salvas."}
      </span>

      <div className={styles.buttons}>
        <Button
          text={cancelText}
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
        />

        <Button
          text={saveText}
          type="submit"
          form={formId}
          disabled={!isDirty || disabled || isSaving}
          loading={isSaving}
        />
      </div>
    </div>
  );
}
