/**
 * Calculates the projected annual dose for a worker based on their current dose history.
 *
 * @param doses Array of dose records for the current year. Expected to have { hp10, month }
 * @param currentYear The current year (e.g., 2024)
 * @param annualLimit The regulatory annual limit in mSv (default: 20)
 * @returns Object containing the accumulated dose, monthly velocity, projected total, and risk status.
 */
export function calculateDoseProjection(
  doses: { hp10: number; month: number }[],
  currentYear: number,
  annualLimit: number = 20,
) {
  if (!doses || doses.length === 0) {
    return {
      accumulated: 0,
      velocity: 0,
      projected: 0,
      isAtRisk: false,
      monthsActive: 0,
    };
  }

  // Calculate total accumulated dose
  const accumulated = doses.reduce(
    (sum, dose) => sum + (Number(dose.hp10) || 0),
    0,
  );

  // Determine how many distinct months have readings
  const uniqueMonths = new Set(doses.map((d) => d.month));
  const monthsActive = uniqueMonths.size;

  if (monthsActive === 0) {
    return {
      accumulated,
      velocity: 0,
      projected: 0,
      isAtRisk: false,
      monthsActive,
    };
  }

  // Calculate Dose Velocity (Average per active month)
  const velocity = accumulated / monthsActive;

  // Calculate remaining months in the year
  // If the latest reading is from month M, remaining is 12 - M.
  // Alternatively, just assume a full 12 month projection based on velocity.
  // A standard projection is Velocity * 12.
  const projected = velocity * 12;

  // Determine if at risk (projected >= limit)
  const isAtRisk = projected >= annualLimit;

  return {
    accumulated: parseFloat(accumulated.toFixed(4)),
    velocity: parseFloat(velocity.toFixed(4)),
    projected: parseFloat(projected.toFixed(4)),
    isAtRisk,
    monthsActive,
  };
}
