import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { format } from 'date-fns';
import { Flame, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { HabitCard } from './dashboard/HabitCard';

interface DashboardProps {
  habits: Habit[];
  onSelectHabit: (id: string) => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onAddHabit: () => void;
  isFocused: boolean;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  habits, 
  onSelectHabit, 
  onToggleDate, 
  onAddHabit,
  isFocused,
  onToggleArchive,
  onDelete
}) => {
  const activeHabits = habits.filter(h => !h.archived);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Track the focused card index for keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // Track number of columns to handle Up/Down navigation correctly
  const [columns, setColumns] = useState(1);
  
  useEffect(() => {
    // Basic column estimation based on Tailwind breakpoints
    const handleResize = () => {
        const w = window.innerWidth;
        if (w >= 1280) setColumns(3); // xl
        else if (w >= 768) setColumns(2); // md
        else setColumns(1);
    };
    
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Keyboard Event Listener
  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        // Nicht eingreifen, wenn in ein Eingabefeld getippt wird
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        // Prevent interfering with global shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        
        // Only handle specific keys
        const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' ', 'Enter'];
        if (!keys.includes(e.key)) return;

        e.preventDefault();

        if (activeHabits.length === 0) return;

        if (e.key === 'ArrowRight') {
            setFocusedIndex(prev => Math.min(prev + 1, activeHabits.length)); // +1 allows reaching the "Add" button
        } else if (e.key === 'ArrowLeft') {
            setFocusedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'ArrowDown') {
            setFocusedIndex(prev => Math.min(prev + columns, activeHabits.length));
        } else if (e.key === 'ArrowUp') {
            setFocusedIndex(prev => Math.max(prev - columns, 0));
        } else if (e.key === ' ' && focusedIndex < activeHabits.length) {
            // Space: Toggle Today
            const habit = activeHabits[focusedIndex];
            onToggleDate(habit.id, todayStr);
        } else if (e.key === 'Enter') {
            if (focusedIndex < activeHabits.length) {
                // Enter on habit: Open it
                onSelectHabit(activeHabits[focusedIndex].id);
            } else {
                // Enter on "Add" button
                onAddHabit();
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, activeHabits, focusedIndex, columns, todayStr, onToggleDate, onSelectHabit, onAddHabit]);


  if (activeHabits.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in outline-none">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
          <Flame size={48} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dein Dashboard ist leer</h2>
        <button 
          onClick={onAddHabit}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 mt-4"
        >
          <Plus size={20} />
          Erstes Ziel erstellen
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 outline-none">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 animate-slide-in flex justify-between items-center">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Du arbeitest aktuell an <span className="font-bold text-emerald-500">{activeHabits.length}</span> Zielen.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          {activeHabits.map((habit, idx) => (
            <HabitCard 
                key={habit.id}
                habit={habit}
                idx={idx}
                isFocused={isFocused && idx === focusedIndex}
                today={today}
                todayStr={todayStr}
                onClick={() => setFocusedIndex(idx)}
                onSelect={() => onSelectHabit(habit.id)}
                onToggleDate={dateStr => onToggleDate(habit.id, dateStr)}
                onToggleArchive={() => onToggleArchive(habit.id)}
                onDelete={() => onDelete(habit.id)}
            />
          ))}
          
          {/* Add Button Card */}
          <button 
             onClick={onAddHabit}
             className={clsx(
                 "border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all min-h-[200px]",
                 isFocused && focusedIndex === activeHabits.length
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 ring-2 ring-emerald-500 scale-[1.02]"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
             )}
          >
             <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                <Plus size={24} />
             </div>
             <span className="font-semibold text-sm">Neues Ziel hinzufügen</span>
          </button>
        </div>
      </div>
    </div>
  );
};