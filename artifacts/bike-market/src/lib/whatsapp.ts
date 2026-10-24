function toAsciiDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - "٠".charCodeAt(0)),
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - "۰".charCodeAt(0)),
    );
}

export function normalizeIraqiWhatsAppNumber(phone: string): string {
  let digits = toAsciiDigits(phone).replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("964")) {
    return `964${digits.slice(3).replace(/^0+/, "")}`;
  }

  if (digits.startsWith("0")) {
    return `964${digits.slice(1)}`;
  }

  if (digits.startsWith("7")) {
    return `964${digits}`;
  }

  return digits;
}

export function createWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
): string | null {
  const normalizedNumber = normalizeIraqiWhatsAppNumber(phone ?? "");
  if (normalizedNumber.length < 8 || normalizedNumber.length > 15) return null;

  const query = new URLSearchParams({ text: message });
  return `https://wa.me/${normalizedNumber}?${query.toString()}`;
}
