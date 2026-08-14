// Amounts are stored as integer minor units. This is display formatting only.
export function formatAmount(amountCents: number, currency: string): string {
  const major = (amountCents / 100).toFixed(2);
  return `${major} ${currency}`;
}
