// Money helpers. All amounts are stored and computed in PAISE (integers).
// Convert to rupees only for display.

/** Convert paise (integer) to a rupee number. 99900 -> 999 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Convert a rupee value to paise (integer). 999 -> 99900 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Format paise as an Indian-locale rupee string, e.g. 99900 -> "₹999".
 * Uses the Indian digit grouping (₹1,00,000).
 */
export function formatINR(paise: number): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}
