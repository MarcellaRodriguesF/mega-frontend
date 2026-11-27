export function formatPhone(value?: string | null): string {
  if (!value) return "";

  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function unformatPhone(value?: string | null): string {
  return value?.replace(/\D/g, "").slice(0, 11) ?? "";
}

export function buildWhatsAppUrl(phone?: string | null): string | null {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (!digits) return null;

  const alreadyHasCountryCode =
    digits.startsWith("55") && (digits.length === 12 || digits.length === 13);

  const international = alreadyHasCountryCode ? digits : `55${digits}`;

  if (international.length < 12) return null;

  return `https://wa.me/${international}`;
}
