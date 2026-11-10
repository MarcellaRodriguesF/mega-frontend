import { useEffect, useMemo } from "react";

export function useFormChanges<T>(initialValue: T | null, currentValue: T) {
  const isDirty = useMemo(() => {
    if (initialValue === null) return false;

    return JSON.stringify(initialValue) !== JSON.stringify(currentValue);
  }, [initialValue, currentValue]);

  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  return { isDirty };
}
