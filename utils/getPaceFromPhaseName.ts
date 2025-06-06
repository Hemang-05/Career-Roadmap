// utils/getPaceFromPhaseName.ts

export function getPaceFromPhaseName(
  phaseName: string,
  completedTasksCount: number = 0
): string {
  // 0) No tasks completed yet
  if (completedTasksCount === 0) {
    return "Start Your Journey";
  }

  // 1) Extract the "MMM YYYY – MMM YYYY" or "Month YYYY – Month YYYY" part
  const inside = phaseName.match(/\(([^)]+)\)/)?.[1];
  if (!inside) {
    console.error("Could not extract month range from phase name:", phaseName);
    return "Unknown";
  }

  // 2) Split into start / end
  const parts = inside.split(/[-–]/).map(s => s.trim());
  if (parts.length !== 2) {
    console.error("Unexpected format for month range:", inside);
    return "Unknown";
  }
  const [startStr, endStr] = parts;

  // 3) Build real Date objects. We append a "1" so both "Sep 2024" and "September 2024" parse.
  function parseMonthYear(str: string): Date | null {
    const d = new Date(`${str} 1`);
    return isNaN(d.getTime()) ? null : d;
  }
  const startDate = parseMonthYear(startStr);
  const endMonthDate = parseMonthYear(endStr);
  if (!startDate || !endMonthDate) {
    console.error("Failed to parse month/year:", startStr, endStr);
    return "Unknown";
  }

  // 4) Get the very last day of the end month
  const endDate = new Date(
    endMonthDate.getFullYear(),
    endMonthDate.getMonth() + 1,
    0
  );

  const today = new Date();
  
  // Compare current date with phase range
  if (today > endDate) {
    // Current date is after the phase range - Behind Track
    return "Behind Track";
  } else if (today < startDate) {
    // Current date is before the phase range - Ahead Of Track
    return "Ahead Of Track";
  } else {
    // Current date is within the phase range - On Track
    return "On Track";
  }
}