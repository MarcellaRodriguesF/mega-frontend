export function moveId(ids: string[], id: string, direction: -1 | 1) {
  const index = ids.indexOf(id);
  const target = index + direction;

  if (index < 0 || target < 0 || target >= ids.length) return null;

  const next = [...ids];
  const current = next[index];
  const swapped = next[target];

  if (!current || !swapped) return null;

  next[index] = swapped;
  next[target] = current;

  return next;
}

export function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
