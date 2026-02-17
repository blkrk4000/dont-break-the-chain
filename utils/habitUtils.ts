import { differenceInCalendarDays, getYear } from 'date-fns';
import { Habit } from '../types';

export const calculateStreakForHabit = (habit: Habit): number => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;

    const parseLocal = (d: string) => {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m - 1, day);
    };

    // Sort dates descending
    const datesDesc = habit.completedDates
      .map(d => parseLocal(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if the chain is active (completed today or yesterday)
    const hasToday = datesDesc.some(d => differenceInCalendarDays(today, d) === 0);
    const hasYesterday = datesDesc.some(d => differenceInCalendarDays(today, d) === 1);

    // If neither today nor yesterday is done, the streak is broken (0)
    if (!hasToday && !hasYesterday) return 0;
    
    let current = datesDesc[0];
    
    // If the gap between today and the last entry is > 1 day, streak is 0
    if (differenceInCalendarDays(today, current) > 1) return 0;

    let streak = 1;
    for (let i = 1; i < datesDesc.length; i++) {
      const prev = datesDesc[i];
      const diff = differenceInCalendarDays(current, prev);
      if (diff === 1) {
        streak++;
        current = prev;
      } else if (diff === 0) {
        continue; // duplicate entry
      } else {
        break; // gap found
      }
    }
    return streak;
};

export const calculateCompletionRate = (habit: Habit): number => {
  if (!habit.completedDates || habit.completedDates.length === 0) return 0;
  
  const currentYear = new Date().getFullYear();
  // Filter completions for the current year
  const thisYearCompletions = habit.completedDates.filter(d => parseInt(d.split('-')[0]) === currentYear).length;
  
  const startOfYear = new Date(currentYear, 0, 1);
  const today = new Date();
  
  // Total days passed so far this year (inclusive)
  const daysPassed = differenceInCalendarDays(today, startOfYear) + 1;
  
  if (daysPassed === 0) return 0;
  
  return Math.round((thisYearCompletions / daysPassed) * 100);
};

export const DEFAULT_HABITS: Habit[] = [
  { 
    id: '1', 
    name: '30 Min Fitness', 
    color: '#3b82f6', 
    completedDates: [], 
    createdAt: new Date().toISOString() 
  },
  { 
    id: '2', 
    name: '30 Min lesen', 
    color: '#8b5cf6', 
    completedDates: [], 
    createdAt: new Date().toISOString() 
  },
];