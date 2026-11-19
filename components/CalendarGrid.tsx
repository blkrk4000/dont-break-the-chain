import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  eachDayOfInterval, 
  endOfMonth, 
  format, 
  isSameDay, 
  isAfter, 
  addDays,
  isSameMonth,
  eachMonthOfInterval,
  endOfYear,
  addMonths
} from 'date-fns';
import { de } from 'date-fns/locale';
import { DayCell } from './DayCell';
import { Habit } from '../types';
import { PanelLeft, PanelLeftClose, LayoutGrid, Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreVertical, Archive, Trash2, ArchiveRestore } from 'lucide-react';
import { clsx } from 'clsx';

interface CalendarGridProps {
  habit: Habit;
  onToggleDate: (dateStr: string) => void;
  currentDate: Date;
  onPrevYear: () => void;
  onNextYear: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isFocused: boolean;
  onToggleArchive: () => void;
  onDelete: () => void;
}

type ViewMode = 'year' | 'month';

export const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  habit, 
  onToggleDate,
  currentDate,
  onPrevYear,
  onNextYear,
  isSidebarOpen,
  toggleSidebar,
  isFocused,
  onToggleArchive,
  onDelete
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [focusedDate, setFocusedDate] = useState(today);
  const [viewMode, setViewMode] = useState<ViewMode>('year');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync focus when current date (year view) changes
  useEffect(() => {
    setFocusedDate(today);
    setIsMenuOpen(false);
  }, [habit.id]);

  // Click outside to close menu
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

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isFocused) return;
        
        if (document.activeElement?.tagName === 'INPUT') return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        let handled = false;
        let newDate = new Date(focusedDate);

        switch(e.key) {
            case 'ArrowRight':
                newDate = addDays(focusedDate, 1);
                handled = true;
                break;
            case 'ArrowLeft':
                newDate = addDays(focusedDate, -1);
                handled = true;
                break;
            case 'ArrowDown':
                newDate = addDays(focusedDate, 7);
                handled = true;
                break;
            case 'ArrowUp':
                newDate = addDays(focusedDate, -7);
                handled = true;
                break;
            case ' ':
                e.preventDefault();
                onToggleDate(format(focusedDate, 'yyyy-MM-dd'));
                return;
        }

        if (handled) {
            e.preventDefault();
            if (isAfter(newDate, today)) {
                return;
            }
            setFocusedDate(newDate);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedDate, onToggleDate, today, isFocused]);

  const months = useMemo(() => {
    if (viewMode === 'month') {
        // In month view, we focus on the month of the FOCUSED date
        return [new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1)];
    }
    
    // Year View logic
    const yearStart = new Date(currentDate.getFullYear(), 0, 1);
    const yearEnd = endOfYear(currentDate);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd });
  }, [currentDate, viewMode, focusedDate]);

  // Helper to check if a date is completed
  const isCompleted = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDates.includes(dateStr);
  };

  const handlePrev = () => {
    if (viewMode === 'year') {
      onPrevYear();
    } else {
      setFocusedDate(prev => addMonths(prev, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'year') {
      onNextYear();
    } else {
      const nextMonth = addMonths(focusedDate, 1);
      // Optional: Prevent going into future months if desired, but usually navigation is allowed
      setFocusedDate(nextMonth);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className={`flex-none px-4 py-2 border-b bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm z-10 h-14 transition-colors ${isFocused ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 opacity-90'}`}>
        <div className="flex items-center gap-4">
            <button 
                onClick={toggleSidebar}
                className="p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-md transition-colors"
                title={isSidebarOpen ? "Seitenleiste einklappen (Ctrl+Shift+S)" : "Seitenleiste ausklappen (Ctrl+Shift+S)"}
            >
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-baseline gap-2">
                <span>{habit.name}</span>
                {habit.archived && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full uppercase tracking-wider font-bold">Archiviert</span>}
                <span className="text-slate-400 font-normal text-sm">
                    {viewMode === 'year' ? `/ ${format(currentDate, 'yyyy')}` : `/ ${format(focusedDate, 'MMMM yyyy', { locale: de })}`}
                </span>
            </h2>
        </div>
        
        <div className="flex items-center gap-3">
            {isFocused && <div className="hidden md:block text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">TAB to Sidebar</div>}
            
            {/* View Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setViewMode('year')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'year' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  title="Jahresansicht"
                >
                    <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('month')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  title="Monatsansicht"
                >
                    <CalendarIcon size={16} />
                </button>
            </div>

            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                <button onClick={handlePrev} title={viewMode === 'year' ? 'Vorheriges Jahr' : 'Vorheriger Monat'} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-all text-slate-600 dark:text-slate-300">
                   <ChevronLeft size={16} />
                </button>
                <button onClick={handleNext} title={viewMode === 'year' ? 'Nächstes Jahr' : 'Nächster Monat'} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-all text-slate-600 dark:text-slate-300">
                   <ChevronRight size={16} />
                </button>
            </div>

             {/* Settings Dropdown */}
             <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    title="Menü: archivieren oder löschen"
                    className={clsx(
                        "p-2 rounded-lg transition-colors",
                        isMenuOpen 
                           ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                           : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                >
                    <MoreVertical size={20} />
                </button>
                
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => {
                                onToggleArchive();
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                        >
                            {habit.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                            {habit.archived ? 'Wiederherstellen' : 'Archivieren'}
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                        <button 
                            onClick={() => {
                                setIsMenuOpen(false);
                                onDelete();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left"
                        >
                            <Trash2 size={16} />
                            Löschen
                        </button>
                    </div>
                )}
             </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 outline-none transition-opacity ${isFocused ? 'opacity-100' : 'opacity-80'}`}>
        
        <div className={viewMode === 'year' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex h-full items-center justify-center"
        }>
          {months.map((monthStart) => {
            const monthEnd = endOfMonth(monthStart);
            const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
            const startDayIndex = parseInt(format(monthStart, 'i')) - 1; // 0 (Mon) - 6 (Sun)

            // Dynamic scaling for month view
            const containerClass = viewMode === 'year'
                ? "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm hover:shadow-md transition-all"
                : "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl transition-all scale-110";

            return (
              <div key={monthStart.toString()} className={containerClass}>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 text-center">
                  {format(monthStart, 'MMMM', { locale: de })} {viewMode === 'month' && format(monthStart, 'yyyy')}
                </h3>
                
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['M', 'D', 'M', 'D', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className={`text-[10px] text-center font-bold ${i >= 5 ? 'text-rose-400' : 'text-slate-300 dark:text-slate-600'}`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {daysInMonth.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const completed = isCompleted(date);
                    const hasFocus = isFocused && isSameDay(date, focusedDate);
                    
                    const prevDate = addDays(date, -1);
                    const nextDate = addDays(date, 1);

                    const connectLeft = completed && isCompleted(prevDate) && isSameMonth(date, prevDate);
                    const connectRight = completed && isCompleted(nextDate) && isSameMonth(date, nextDate);

                    return (
                      <div key={dateStr} className="relative">
                         <DayCell
                            date={date}
                            isCompleted={completed}
                            isToday={isSameDay(date, today)}
                            isFuture={isAfter(date, today)}
                            isFocused={hasFocus}
                            onClick={() => {
                                setFocusedDate(date);
                                onToggleDate(dateStr);
                            }}
                            connectLeft={connectLeft}
                            connectRight={connectRight}
                            color={habit.color}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};