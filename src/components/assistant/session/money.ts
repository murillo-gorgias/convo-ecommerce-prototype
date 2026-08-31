/**
 * Prices, written the way the store writes them.
 *
 * One place, because a total that disagrees with the line above it by a
 * formatting decision reads as a bug in the shop rather than a bug in the
 * prototype.
 */
export const money = (amount: number) =>
  `$${amount.toFixed(2)}`;

/** The same, written as an amount taken off. */
export const less = (amount: number) => `−${money(amount)}`;
