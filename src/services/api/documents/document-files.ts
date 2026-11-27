import type { SaveDocumentRequest } from "./documents.types";

export function toDocumentFormData(data: SaveDocumentRequest) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("type", data.type ?? "");
  formData.append("observations", data.observations ?? "");

  if (data.unitId !== undefined) {
    formData.append("unitId", data.unitId ?? "");
  }

  if (data.file instanceof File) {
    formData.append("file", data.file, data.file.name);
  }

  return formData;
}

export function saveDocumentFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function openDocumentPreview(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const preview = window.open(url, "_blank", "noopener,noreferrer");

  if (!preview) {
    URL.revokeObjectURL(url);
    saveDocumentFile(blob, fileName);
    return;
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}
