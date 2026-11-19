import React from 'react';
import { clsx } from 'clsx';
import { format, isWeekend } from 'date-fns';
import { de } from 'date-fns/locale';

interface DayCellProps {
  date: Date;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  isFocused?: boolean;
  onClick: () => void;
  connectLeft: boolean;
  connectRight: boolean;
  color: string;
}

export const DayCell: React.FC<DayCellProps> = ({
  date,
  isCompleted,
  isToday,
  isFuture,
  isFocused,
  onClick,
  connectLeft,
  connectRight,
  color
}) => {
  const isWknd = isWeekend(date);
  
  // Base classes for the cell
  const baseClasses = "relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-xs font-medium transition-all duration-200 cursor-pointer select-none z-10";
  
  return (
    <div className="relative flex items-center justify-center p-0.5">
      {/* Connection Lines (rendered behind the cell content) */}
      {connectLeft && (
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[60%] z-0" 
          style={{ backgroundColor: color, opacity: 0.6 }} 
        />
      )}
      {connectRight && (
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-[60%] z-0" 
          style={{ backgroundColor: color, opacity: 0.6 }} 
        />
      )}

      <div
        onClick={!isFuture ? onClick : undefined}
        title={`${format(date, 'P', { locale: de })}${isCompleted ? ' – erledigt' : isFuture ? '' : ' – noch offen'}`}
        style={isCompleted ? { backgroundColor: color, borderColor: color } : {}}
        className={clsx(
          baseClasses,
          "rounded-md border",
          // Completed State
          isCompleted && "text-white shadow-sm",
          
          // Incomplete State
          !isCompleted && [
            "bg-white dark:bg-slate-800",
            "border-slate-200 dark:border-slate-700",
            "text-slate-500 dark:text-slate-400",
            !isFuture && "hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-sm"
          ],

          // Weekend styling (slightly darker bg if not completed)
          (!isCompleted && isWknd) && "bg-slate-50 dark:bg-slate-800/50",

          // Today styling
          (isToday && !isCompleted) && "ring-2 ring-slate-400 dark:ring-slate-500 font-bold text-slate-900 dark:text-white",

          // Future state
          isFuture && "opacity-30 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800",

          // Focus State (Lift effect)
          isFocused && "z-20 scale-110 shadow-lg ring-1 ring-slate-900/10 dark:ring-white/20"
        )}
      >
        {format(date, 'd')}
      </div>
    </div>
  );
};