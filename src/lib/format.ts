function toDate(value: string | Date | undefined | null) {
  if (!value) return null;
  if (value instanceof Date) return value;
  // yyyy-mm-dd (date type) or ISO string (created_at)
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export function formatDate(value: string | Date | undefined | null) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "PHP" }).format(value);
}


