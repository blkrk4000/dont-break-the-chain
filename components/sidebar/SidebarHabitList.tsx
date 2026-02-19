import React, { useState } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import { Habit } from '../../types';
import { clsx } from 'clsx';
import { SidebarHabitItem } from './SidebarHabitItem';

interface SidebarHabitListProps {
  habits: Habit[];
  activeHabitId: string | null;
  onSelectHabit: (id: string | null) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  onDeleteHabit: (id: string) => void;
  onRenameHabit: (id: string, newName: string) => void;
  onReorderHabits: (habits: Habit[]) => void;
  onToggleArchive: (id: string) => void;
  streaks: { [id: string]: number };
  isFocused: boolean;
}

export const SidebarHabitList: React.FC<SidebarHabitListProps> = ({
  habits,
  activeHabitId,
  onSelectHabit,
  onAddHabit,
  onDeleteHabit,
  onRenameHabit,
  onReorderHabits,
  onToggleArchive,
  streaks,
  isFocused
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [view, setView] = useState<'active' | 'archived'>('active');
  
  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  // Filter habits based on view
  const displayHabits = habits.filter(h => view === 'active' ? !h.archived : h.archived);

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    onAddHabit({ name: newHabitName, color: selectedColor });
    setNewHabitName('');
    setIsAdding(false);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    if (view !== 'active') return;

    const activeHabits = habits.filter(h => !h.archived);
    const archivedHabits = habits.filter(h => h.archived);

    const newActive = [...activeHabits];
    const [movedItem] = newActive.splice(draggedIndex, 1);
    newActive.splice(dropIndex, 0, movedItem);

    onReorderHabits([...newActive, ...archivedHabits]);
    setDraggedIndex(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex w-full border-b border-slate-200/50 dark:border-slate-800/50 mt-1">
        <button 
           onClick={() => setView('active')}
           className={clsx("flex-1 text-center py-2 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2", view === 'active' ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-slate-50 dark:bg-slate-900/50" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}
        >
          Aktiv
        </button>
        <button 
           onClick={() => setView('archived')}
           className={clsx("flex-1 text-center py-2 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2", view === 'archived' ? "border-slate-500 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}
        >
          Archiv
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        
        {view === 'active' && (
            <button
              onClick={() => onSelectHabit(null)}
              className={clsx(
                "w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 mb-2",
                activeHabitId === null
                  ? [
                      "bg-white dark:bg-slate-800/80 shadow-sm text-slate-900 dark:text-white",
                      isFocused 
                        ? "ring-1 ring-emerald-500/50 dark:ring-emerald-400/50" 
                        : "ring-1 ring-slate-200 dark:ring-slate-700"
                    ]
                  : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400"
              )}
            >
              <div className={clsx("p-1 rounded bg-slate-100 dark:bg-slate-800 transition-colors", activeHabitId === null ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")}>
                 <LayoutGrid size={16} />
              </div>
              <span className="font-semibold text-sm">Dashboard</span>
            </button>
        )}

        {view === 'active' && isFocused && (
             <div className="mb-2 px-1 text-[10px] text-slate-400 font-mono text-center opacity-70">
                TAB für Kalender-Fokus
             </div>
        )}

        {displayHabits.length === 0 && (
           <div className="text-center py-8 text-xs text-slate-400">
             {view === 'active' ? "Keine aktiven Ziele." : "Archiv ist leer."}
           </div>
        )}
        
        {displayHabits.map((habit, index) => (
            <SidebarHabitItem 
                key={habit.id}
                habit={habit}
                isActive={habit.id === activeHabitId}
                isFocused={isFocused}
                streak={streaks[habit.id] || 0}
                view={view}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onSelect={() => onSelectHabit(habit.id)}
                onRename={(newName) => onRenameHabit(habit.id, newName)}
                onToggleArchive={() => onToggleArchive(habit.id)}
                onDelete={() => onDeleteHabit(habit.id)}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
            />
        ))}

        {view === 'active' && (
            isAdding ? (
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg mt-2 border border-slate-200 dark:border-slate-700 shadow-lg animate-in fade-in slide-in-from-top-1">
                <input
                    autoFocus
                    type="text"
                    placeholder="Name..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none mb-2 placeholder:text-slate-400 dark:text-white transition-all"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); 
                            handleAdd();
                        }
                    }}
                />
                <div className="flex gap-1.5 mb-2 flex-wrap justify-center bg-slate-50 dark:bg-slate-950 p-1.5 rounded-md">
                    {colors.map(c => (
                    <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={clsx(
                        "w-4 h-4 rounded-full transition-all duration-300 hover:scale-110",
                        selectedColor === c ? "ring-1 ring-offset-1 ring-slate-400 dark:ring-slate-500 scale-110" : "opacity-60 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c }}
                    />
                    ))}
                </div>
                <div className="flex gap-1.5">
                    <button 
                    onClick={handleAdd}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1 rounded-md text-[10px] font-bold transition-all shadow-sm"
                    >
                    OK
                    </button>
                    <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-1 rounded-md text-[10px] font-medium transition-colors"
                    >
                    Abbruch
                    </button>
                </div>
                </div>
            ) : (
                <button
                onClick={() => setIsAdding(true)}
                className="w-full mt-2 flex items-center justify-center gap-2 p-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-xs font-medium group"
                >
                <Plus size={12} className="group-hover:scale-110 transition-transform" />
                Neues Ziel
                </button>
            )
        )}
      </div>
    </div>
  );
};