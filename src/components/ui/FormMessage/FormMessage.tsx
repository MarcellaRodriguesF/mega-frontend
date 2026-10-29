import styles from "./FormMessage.module.css";

interface FormMessageProps {
  message: string;
  id?: string;
}

export default function FormMessage({ message, id }: FormMessageProps) {
  if (!message) return null;

  return (
    <p id={id} className={styles.message} role="alert">
      {message}
    </p>
  );
}
