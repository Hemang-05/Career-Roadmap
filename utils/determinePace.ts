// utils/determinePace.ts
export function determinePace(
  plannedStart: Date,
  plannedEnd: Date,
  currentDate: Date
): string {
  const currentMonth = currentDate.getMonth(); // 0 = January, 11 = December
  const startMonth = plannedStart.getMonth();
  const endMonth = plannedEnd.getMonth();

  if (currentMonth < startMonth) {
    return "Before Track"; // Current month is before the planned start month.
  } else if (currentMonth >= startMonth && currentMonth <= endMonth) {
    return "On Track"; // Current month is within the planned range.
  } else {
    return "After Track"; // Current month is after the planned end month.
  }
}
