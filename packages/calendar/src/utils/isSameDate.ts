export default function isSameDate(baseDate: Date, targetDate: Date): boolean {
  return (
    baseDate.getFullYear() === targetDate.getFullYear() &&
    baseDate.getMonth() === targetDate.getMonth() &&
    baseDate.getDate() === targetDate.getDate()
  );
}
