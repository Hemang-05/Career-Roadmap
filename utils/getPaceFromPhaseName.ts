// utils/getPaceFromPhaseName.ts
export function getPaceFromPhaseName(phaseName: string, completedTasksCount: number = 0): string {
    try {
      // Check if the user has completed any tasks yet
      if (completedTasksCount === 0) {
        return "Start Your Journey"; // Special message for new users
      }
      
      // Current date for comparison
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-12 format
      console.log("Current month:", currentMonth);
      
      // Extract month range from phase name using regex
      // Matches patterns like "Phase 1 (April - June)" to extract "April - June"
      const monthRangeMatch = phaseName.match(/\((.*?)\)/);
      if (!monthRangeMatch || !monthRangeMatch[1]) {
        console.error("Could not extract month range from phase name:", phaseName);
        return "Unknown";
      }
      
      const monthRange = monthRangeMatch[1];
      console.log("Extracted month range:", monthRange);
      
      // Split into start and end months
      const [startMonthStr, endMonthStr] = monthRange.split('-').map(m => m.trim());
      console.log("Start month:", startMonthStr, "End month:", endMonthStr);
      
      // Convert month names to numbers (1-12)
      const monthNameToNumber: Record<string, number> = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4,
        'may': 5, 'june': 6, 'july': 7, 'august': 8,
        'september': 9, 'october': 10, 'november': 11, 'december': 12
      };
      
      const startMonth = monthNameToNumber[startMonthStr.toLowerCase()];
      const endMonth = monthNameToNumber[endMonthStr.toLowerCase()];
      
      if (!startMonth || !endMonth) {
        console.error("Could not parse month names:", startMonthStr, endMonthStr);
        return "Unknown";
      }
      
      console.log("Parsed months - Start:", startMonth, "End:", endMonth, "Current:", currentMonth);
      
      // Logic based on the requirements:
      // 1. On Track: Current month is within the phase's month range
      // 2. Ahead of Track: Current month is BEFORE the phase's start month
      // 3. Behind of Track: Current month is AFTER the phase's end month
      
      if (currentMonth >= startMonth && currentMonth <= endMonth) {
        return "On Track"; // Current month is within range
      } else if (currentMonth < startMonth) {
        return "Ahead Of Track"; // Current month is before the phase's start month
      } else {
        return "Behind Track"; // Current month is after the phase's end month
      }
    } catch (error) {
      console.error("Error determining pace from phase name:", error);
      return "Unknown";
    }
  }