export default function isSameYearAndMonth(baseDate: Date, targetDate: Date): boolean {
  return targetDate.getMonth() === baseDate.getMonth() && targetDate.getFullYear() === baseDate.getFullYear();
}
