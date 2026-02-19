import React, { useState } from 'react';
import { Plus, Trash2, Check, Flame, GripVertical, Edit2, Archive, ArchiveRestore } from 'lucide-react';
import { Habit } from '../../types';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface SidebarHabitListProps {
  habits: Habit[];
  activeHabitId: string;
  onSelectHabit: (id: string) => void;
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
  
  // Renaming State
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  
  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filter habits based on view
  const displayHabits = habits.filter(h => view === 'active' ? !h.archived : h.archived);

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    onAddHabit({ name: newHabitName, color: selectedColor });
    setNewHabitName('');
    setIsAdding(false);
  };

  const startEditing = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setTempName(habit.name);
  };

  const saveEditing = () => {
    if (editingHabitId && tempName.trim()) {
      onRenameHabit(editingHabitId, tempName.trim());
    }
    setEditingHabitId(null);
    setTempName('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditing();
    } else if (e.key === 'Escape') {
      setEditingHabitId(null);
    }
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

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return <Flame size={12} className="text-slate-300 dark:text-slate-600" />;
    if (streak === 1) return <span className="text-xs leading-none filter grayscale hover:grayscale-0 transition-all">🙂</span>;
    if (streak <= 3) return <span className="text-xs leading-none filter grayscale-[0.5] hover:grayscale-0 transition-all">😄</span>;
    if (streak <= 6) return <span className="text-xs leading-none">😍</span>;
    if (streak <= 14) return <span className="text-xs leading-none">🔥</span>;
    if (streak <= 30) return <span className="text-xs leading-none">🚀</span>;
    return <span className="text-xs leading-none">🏆</span>;
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
        
        {displayHabits.map((habit, index) => {
            const streak = streaks[habit.id] || 0;
            const isTodayDone = habit.completedDates.includes(todayStr);
            const isActive = habit.id === activeHabitId;
            const isEditing = habit.id === editingHabitId;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={habit.id}
                draggable={view === 'active' && !isEditing}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => onSelectHabit(habit.id)}
                className={clsx(
                  "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 relative overflow-visible",
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
                {isActive && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-emerald-500 rounded-r" />}

                <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
                  {/* Drag Handle - only visible on hover, absolute positioned to not take space */}
                  {view === 'active' && !isEditing && (
                    <div className="absolute left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500">
                      <GripVertical size={12} />
                    </div>
                  )}

                  <div className="relative flex-shrink-0 ml-1 group-hover:ml-4 transition-all duration-200">
                    <div 
                        className={clsx("w-2 h-2 rounded-full ring-2 ring-offset-1 ring-offset-slate-50 dark:ring-offset-slate-900 transition-all", isActive ? "scale-105" : "")}
                        style={{ backgroundColor: habit.color, '--tw-ring-color': isActive ? habit.color : 'transparent' } as React.CSSProperties}
                    />
                  </div>
                  
                  <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                    {isEditing ? (
                      <input 
                          type="text"
                          autoFocus
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={handleEditKeyDown}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-b border-emerald-500 focus:outline-none w-full text-xs font-semibold text-slate-900 dark:text-white p-0 rounded-none leading-tight"
                      />
                    ) : (
                      <span 
                        onDoubleClick={() => startEditing(habit)}
                        title={habit.name}
                        className={clsx("font-semibold text-sm truncate leading-tight select-none", isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}
                      >
                          {habit.name}
                      </span>
                    )}
                    
                    {view === 'active' && (
                        <div className="flex items-center gap-2">
                            <span className={clsx("text-[10px] font-medium flex items-center gap-1 transition-colors", streak > 0 ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-600")}>
                                {getStreakEmoji(streak)}
                                <span>{streak} {streak === 1 ? 'Tag' : 'Tage'}</span>
                            </span>
                        </div>
                    )}
                  </div>
                </div>
                
                {/* Right Side Actions/Status */}
                <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                    
                    {/* Hover Actions Menu */}
                    {!isEditing && (
                       <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {view === 'active' ? (
                             <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); startEditing(habit); }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-all"
                                    title="Umbenennen"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onToggleArchive(habit.id); }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-all"
                                    title="Archivieren (Pausieren)"
                                >
                                    <Archive size={12} />
                                </button>
                             </>
                          ) : (
                             <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onToggleArchive(habit.id); }}
                                    className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-500 rounded transition-all"
                                    title="Wiederherstellen"
                                >
                                    <ArchiveRestore size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteHabit(habit.id); }}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded transition-all"
                                    title="Endgültig löschen"
                                >
                                    <Trash2 size={12} />
                                </button>
                             </>
                          )}
                       </div>
                    )}

                    {view === 'active' && isTodayDone && !isEditing && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ml-1">
                            <Check size={10} strokeWidth={3} />
                        </div>
                    )}
                </div>
              </div>
            );
        })}

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