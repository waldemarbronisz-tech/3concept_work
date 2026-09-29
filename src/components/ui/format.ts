/** Godziny po polsku z jednym miejscem po przecinku: 8 → "8,0". */
export function formatHours(value: number): string {
  return value.toFixed(1).replace(".", ",");
}
