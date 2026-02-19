export interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: string[]; // ISO date strings YYYY-MM-DD
  createdAt: string;
  archived?: boolean;
}