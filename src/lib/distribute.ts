/**
 * Distribute totalAmount among count people randomly.
 * Each person gets at least 1 unit (taka).
 * Returns an array of amounts that sum to totalAmount.
 */
export function distributeRandomly(totalAmount: number, count: number): number[] {
  if (count <= 0 || totalAmount <= 0) return [];
  if (count === 1) return [totalAmount];

  // Ensure minimum 1 per person
  const minPerPerson = 1;
  let remaining = totalAmount - minPerPerson * count;

  if (remaining < 0) {
    // If total is less than count, some people get 0
    const amounts = new Array(count).fill(0);
    for (let i = 0; i < totalAmount; i++) {
      amounts[i] = 1;
    }
    // Shuffle
    for (let i = amounts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [amounts[i], amounts[j]] = [amounts[j], amounts[i]];
    }
    return amounts;
  }

  // Generate random breakpoints
  const breakpoints: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    breakpoints.push(Math.random() * remaining);
  }
  breakpoints.sort((a, b) => a - b);

  const amounts: number[] = [];
  let prev = 0;
  for (let i = 0; i < breakpoints.length; i++) {
    amounts.push(Math.floor(breakpoints[i] - prev) + minPerPerson);
    prev = breakpoints[i];
  }
  amounts.push(Math.floor(remaining - prev) + minPerPerson);

  // Fix rounding errors - adjust last element
  const currentSum = amounts.reduce((a, b) => a + b, 0);
  const diff = totalAmount - currentSum;
  amounts[amounts.length - 1] += diff;

  // Shuffle to randomize order
  for (let i = amounts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [amounts[i], amounts[j]] = [amounts[j], amounts[i]];
  }

  return amounts;
}
