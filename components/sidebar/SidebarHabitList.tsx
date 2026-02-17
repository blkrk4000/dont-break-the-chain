import React, { useState } from 'react';
import { Plus, Trash2, Check, Flame, GripVertical } from 'lucide-react';
import { Habit } from '../../types';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface SidebarHabitListProps {
  habits: Habit[];
  activeHabitId: string;
  onSelectHabit: (id: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  onDeleteHabit: (id: string) => void;
  onReorderHabits: (habits: Habit[]) => void;
  streaks: { [id: string]: number };
  isFocused: boolean;
}

export const SidebarHabitList: React.FC<SidebarHabitListProps> = ({
  habits,
  activeHabitId,
  onSelectHabit,
  onAddHabit,
  onDeleteHabit,
  onReorderHabits,
  streaks,
  isFocused
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  
  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

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

    const newHabits = [...habits];
    const [movedItem] = newHabits.splice(draggedIndex, 1);
    newHabits.splice(dropIndex, 0, movedItem);

    onReorderHabits(newHabits);
    setDraggedIndex(null);
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return <Flame size={14} className="text-slate-300 dark:text-slate-600" />;
    if (streak === 1) return <span className="text-sm leading-none filter grayscale hover:grayscale-0 transition-all">🙂</span>;
    if (streak <= 3) return <span className="text-sm leading-none filter grayscale-[0.5] hover:grayscale-0 transition-all">😄</span>;
    if (streak <= 6) return <span className="text-sm leading-none">😍</span>;
    if (streak <= 14) return <span className="text-sm leading-none">🔥</span>;
    if (streak <= 30) return <span className="text-sm leading-none">🚀</span>;
    return <span className="text-sm leading-none">🏆</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
      <div className="flex justify-between items-center mb-3 px-2">
         <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Deine Ziele</div>
         {isFocused && <div className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono font-medium">TAB to Grid</div>}
      </div>
      
      {habits.map((habit, index) => {
          const streak = streaks[habit.id] || 0;
          const isTodayDone = habit.completedDates.includes(todayStr);
          const isActive = habit.id === activeHabitId;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={habit.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => onSelectHabit(habit.id)}
              className={clsx(
                "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden",
                // Active State
                isActive
                  ? [
                      "bg-white dark:bg-slate-800/80 shadow-sm",
                      isFocused 
                        ? "ring-1 ring-emerald-500/50 dark:ring-emerald-400/50" 
                        : "ring-1 ring-slate-200 dark:ring-slate-700"
                    ]
                  : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30",
                
                // Dragging Styles
                isDragging && "opacity-40 scale-95 grayscale",
                isDragOver && !isDragging && "border-t-2 border-emerald-500"
              )}
            >
              {/* Active Indicator Bar */}
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}

              <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 pl-1">
                {/* Drag Handle - visible on hover */}
                <div className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 -ml-2 hover:text-slate-500">
                  <GripVertical size={14} />
                </div>

                <div className="relative flex-shrink-0">
                  <div 
                      className={clsx("w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 transition-all", isActive ? "scale-110" : "")}
                      style={{ backgroundColor: habit.color, '--tw-ring-color': isActive ? habit.color : 'transparent' } as React.CSSProperties}
                  />
                </div>
                
                <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                  <span className={clsx("font-semibold text-sm truncate leading-tight", isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                      {habit.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={clsx("text-xs font-medium flex items-center gap-1.5 transition-colors", streak > 0 ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-600")}>
                        {getStreakEmoji(streak)}
                        <span>{streak} {streak === 1 ? 'Tag' : 'Tage'}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right Side Actions/Status */}
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  {isActive && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteHabit(habit.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-lg transition-all flex-shrink-0"
                      title="Ziel löschen"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {isTodayDone && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                          <Check size={12} strokeWidth={3} />
                      </div>
                  )}
              </div>
            </div>
          );
      })}

      {isAdding ? (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl mt-4 border border-slate-200 dark:border-slate-700 shadow-lg animate-in fade-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            placeholder="Name..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none mb-3 placeholder:text-slate-400 dark:text-white transition-all"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex gap-2 mb-3 flex-wrap justify-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={clsx(
                  "w-5 h-5 rounded-full transition-all duration-300 hover:scale-110",
                  selectedColor === c ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110" : "opacity-60 hover:opacity-100"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleAdd}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              Erstellen
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              Abbruch
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-sm font-medium group"
        >
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Plus size={14} />
          </div>
          Neues Ziel
        </button>
      )}
    </div>
  );
};