export const SUGGESTED_EVIDENCE_TYPES = ["PHOTO", "PDF", "DOCUMENT"] as const;

export const EvidenceTypeLabel = (value: string) => {
  const map: Record<string, string> = {
    PHOTO: "Foto",
    PDF: "PDF",
    DOCUMENT: "Documento",
  };

  return map[value] ?? value;
};
