// // utils/determinePace.ts
// export function determinePace(
//   plannedStart: Date,
//   plannedEnd: Date,
//   currentDate: Date
// ): string {
//   console.log("Determining pace with:", {
//     plannedStart: plannedStart.toISOString(),
//     plannedEnd: plannedEnd.toISOString(),
//     currentDate: currentDate.toISOString()
//   });
  
//   // Convert all dates to timestamp for easier comparison
//   const startTime = plannedStart.getTime();
//   const endTime = plannedEnd.getTime();
//   const currentTime = currentDate.getTime();
  
//   if (currentTime < startTime) {
//     return "Behind Track"; // Current date is before the planned start date
//   } else if (currentTime >= startTime && currentTime <= endTime) {
//     return "On Track"; // Current date is within the planned range
//   } else {
//     return "Ahead Of Track"; // Current date is after the planned end date
//   }
// }