import React, { useState } from 'react';
import { Habit } from '../../types';
import { GripVertical, Edit2, Archive, ArchiveRestore, Trash2, Check, Flame } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface SidebarHabitItemProps {
  habit: Habit;
  isActive: boolean;
  isFocused: boolean;
  streak: number;
  view: 'active' | 'archived';
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onRename: (newName: string) => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export const SidebarHabitItem: React.FC<SidebarHabitItemProps> = ({
  habit,
  isActive,
  isFocused,
  streak,
  view,
  isDragging,
  isDragOver,
  onSelect,
  onRename,
  onToggleArchive,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(habit.name);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isTodayDone = habit.completedDates.includes(todayStr);

  const startEditing = () => {
    setIsEditing(true);
    setTempName(habit.name);
  };

  const saveEditing = () => {
    if (tempName.trim()) {
        onRename(tempName.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditing();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempName(habit.name);
    }
  };

  const getStreakEmoji = (s: number) => {
    if (s === 0) return <Flame size={12} className="text-slate-300 dark:text-slate-600" />;
    if (s === 1) return <span className="text-xs leading-none filter grayscale hover:grayscale-0 transition-all">🙂</span>;
    if (s <= 3) return <span className="text-xs leading-none filter grayscale-[0.5] hover:grayscale-0 transition-all">😄</span>;
    if (s <= 6) return <span className="text-xs leading-none">😍</span>;
    if (s <= 14) return <span className="text-xs leading-none">🔥</span>;
    if (s <= 30) return <span className="text-xs leading-none">🚀</span>;
    return <span className="text-xs leading-none">🏆</span>;
  };

  return (
    <div
        draggable={view === 'active' && !isEditing}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onSelect}
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
            {/* Drag Handle */}
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
                        onDoubleClick={(e) => { e.stopPropagation(); startEditing(); }}
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
                            onClick={(e) => { e.stopPropagation(); startEditing(); }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-all"
                            title="Umbenennen"
                        >
                            <Edit2 size={12} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleArchive(); }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-all"
                            title="Archivieren (Pausieren)"
                        >
                            <Archive size={12} />
                        </button>
                        </>
                    ) : (
                        <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleArchive(); }}
                            className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-500 rounded transition-all"
                            title="Wiederherstellen"
                        >
                            <ArchiveRestore size={12} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
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
};