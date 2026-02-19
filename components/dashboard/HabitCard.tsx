import React, { useRef, useState, useEffect } from 'react';
import { Habit } from '../../types';
import { calculateStreakForHabit, calculateCompletionRate } from '../../utils/habitUtils';
import { Flame, Check, MoreVertical, Archive, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { format, isSameDay, eachDayOfInterval, addWeeks } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onClick: () => void;
  onSelect: () => void;
  onToggleDate: (dateStr: string) => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  isFocused: boolean;
  today: Date;
  todayStr: string;
  idx: number; // needed for animation delay
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onClick,
  onSelect,
  onToggleDate,
  onToggleArchive,
  onDelete,
  isFocused,
  today,
  todayStr,
  idx
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const streak = calculateStreakForHabit(habit);
  const rate = calculateCompletionRate(habit);
  const isTodayDone = habit.completedDates.includes(todayStr);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // GitHub Graph Logic Helper
  const heatmapDays = React.useMemo(() => {
    const getStartOfWeek = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = (day === 0 ? 6 : day - 1);
        date.setDate(date.getDate() - diff);
        date.setHours(0, 0, 0, 0);
        return date;
    };
    const getEndOfWeek = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = (day === 0 ? 0 : 7 - day);
        date.setDate(date.getDate() + diff);
        date.setHours(23, 59, 59, 999);
        return date;
    };
    const start = getStartOfWeek(addWeeks(today, -13));
    const end = getEndOfWeek(today);
    return eachDayOfInterval({ start, end });
  }, [today]);

  return (
    <div 
      onClick={onClick}
      className={clsx(
          "bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition-all animate-slide-in group flex flex-col h-full",
          isFocused 
              ? "ring-2 ring-emerald-500 border-transparent shadow-lg shadow-emerald-500/10 scale-[1.02] z-10" 
              : "border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
      )}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative">
        <div 
          className="cursor-pointer flex-1" 
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center gap-2">
             <span className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
             {habit.name}
          </h3>
          <div className="text-xs text-slate-500 mt-1 flex gap-3">
             <span className="flex items-center gap-1">
               <Flame size={12} className={streak > 0 ? "text-orange-500" : "text-slate-300"} />
               {streak} Tage Streak
             </span>
             <span className="text-slate-300">•</span>
             <span>{rate}% Jahresquote</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
            {/* Check Button */}
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  onToggleDate(todayStr);
              }}
              className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm shrink-0",
              isTodayDone 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
              isFocused && !isTodayDone && "ring-1 ring-slate-300 dark:ring-slate-600"
              )}
              title={isTodayDone ? "Heute erledigt!" : "Heute abhaken"}
            >
              <Check size={16} strokeWidth={3} />
            </button>

            {/* Options Button */}
            <div className="relative">
                <button
                  onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                  }}
                  className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400",
                      isMenuOpen && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  )}
                >
                  <MoreVertical size={16} />
                </button>
                
                {isMenuOpen && (
                  <div ref={menuRef} className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                      <button 
                          onClick={() => {
                              setIsMenuOpen(false);
                              onToggleArchive();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                      >
                          <Archive size={14} />
                          Archivieren
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                      <button 
                          onClick={() => {
                              setIsMenuOpen(false);
                              onDelete();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left"
                      >
                          <Trash2 size={14} />
                          Löschen
                      </button>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* GitHub-style Heatmap */}
      <div className="mt-auto pt-2 pointer-events-none">
         <div className="flex justify-between items-end mb-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Letzte 3 Monate</div>
         </div>
         
         <div 
            className="grid grid-rows-7 grid-flow-col gap-1 w-full overflow-hidden" 
            style={{ height: '80px' }}
         >
            {heatmapDays.map((date) => {
               const dStr = format(date, 'yyyy-MM-dd');
               const isDone = habit.completedDates.includes(dStr);
               const isToday = isSameDay(date, today);
               
               return (
                  <div 
                    key={dStr}
                    className={clsx(
                      "w-2.5 h-2.5 rounded-[2px] transition-colors",
                      isDone 
                        ? "opacity-100" 
                        : "bg-slate-100 dark:bg-slate-800",
                      isToday && !isDone && "ring-1 ring-slate-400 dark:ring-slate-500"
                    )}
                    style={{ 
                      backgroundColor: isDone ? habit.color : undefined 
                    }}
                  />
               );
            })}
         </div>
      </div>
    </div>
  );
};