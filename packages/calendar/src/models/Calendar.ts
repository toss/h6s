export interface DateCell {
  value: Date;
}

export interface WeekRow {
  value: DateCell[];
}

export interface MonthMatrix {
  value: WeekRow[];
}
