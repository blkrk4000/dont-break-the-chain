import React, { useState, useRef } from 'react';
import { Plus, Trash2, Activity, Moon, Sun, Settings, Info, Download, Upload, CircleHelp, Check, Keyboard, MousePointer, Flame, BarChart2 } from 'lucide-react';
import { Habit } from '../types';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { Modal } from './Modal';
import { calculateCompletionRate } from '../utils/habitUtils';

interface SidebarProps {
  habits: Habit[];
  activeHabitId: string;
  onSelectHabit: (id: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  onDeleteHabit: (id: string) => void;
  streaks: { [id: string]: number };
  toggleTheme: () => void;
  isDark: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  isFocused: boolean;
}

type ModalType = 'settings' | 'info' | 'help' | 'stats' | null;

export const Sidebar: React.FC<SidebarProps> = ({ 
  habits, 
  activeHabitId, 
  onSelectHabit, 
  onAddHabit,
  onDeleteHabit,
  streaks,
  toggleTheme,
  isDark,
  onExport,
  onImport,
  isFocused
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const activeHabit = habits.find(h => h.id === activeHabitId);

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    onAddHabit({ name: newHabitName, color: selectedColor });
    setNewHabitName('');
    setIsAdding(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return <Flame size={12} className="text-slate-300" />;
    if (streak === 1) return <span className="text-sm leading-none">🙂</span>;
    if (streak <= 3) return <span className="text-sm leading-none">😄</span>;
    if (streak <= 6) return <span className="text-sm leading-none">😍</span>;
    if (streak <= 14) return <span className="text-sm leading-none">🔥</span>;
    if (streak <= 30) return <span className="text-sm leading-none">🚀</span>;
    return <span className="text-sm leading-none">🏆</span>;
  };

  const IconButton = ({ icon: Icon, onClick, title, active }: { icon: any, onClick: () => void, title: string, active?: boolean }) => (
    <button 
      onClick={onClick}
      title={title}
      className={clsx(
        "p-2 rounded-lg transition-colors",
        active 
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
    >
      <Icon size={18} />
    </button>
  );

  const getModalTitle = () => {
    switch (activeModal) {
      case 'settings': return <><Settings size={20} /> Einstellungen</>;
      case 'info': return <><Info size={20} /> Die Methode</>;
      case 'help': return <><CircleHelp size={20} /> Hilfe & Shortcuts</>;
      case 'stats': return <><BarChart2 size={20} /> Statistik</>;
      default: return null;
    }
  };

  return (
    <>
      <div className="w-full h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-xl z-20">
        <div className="p-4 flex-none border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-emerald-500">
               <Activity size={20} />
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Jerry Seinfeld's</span>
            </div>
            <h1 className="text-lg font-black tracking-tight leading-tight">
              Don't Break The Chain
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          <div className="flex justify-between items-center mb-2 px-1">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deine Ziele</div>
             {isFocused && <div className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">TAB to Grid</div>}
          </div>
          
          {habits.map((habit) => {
              const streak = streaks[habit.id] || 0;
              const isTodayDone = habit.completedDates.includes(todayStr);
              const isActive = habit.id === activeHabitId;

              return (
                <div
                  key={habit.id}
                  onClick={() => onSelectHabit(habit.id)}
                  className={clsx(
                    "group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200 border relative",
                    isActive
                      ? [
                          "bg-slate-100 dark:bg-slate-800",
                          isFocused 
                            ? "border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/50 shadow-md scale-[1.02]" 
                            : "border-slate-200 dark:border-slate-700 shadow-sm"
                        ]
                      : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: habit.color }}
                      />
                    </div>
                    
                    <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                      <span className={clsx("font-semibold text-sm truncate", isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                          {habit.name}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={clsx("text-xs font-bold flex items-center gap-1.5 transition-colors", streak > 0 ? "text-slate-700 dark:text-slate-300" : "text-slate-400")}>
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
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 rounded-md transition-all flex-shrink-0"
                          title="Ziel löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {isTodayDone && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <Check size={10} strokeWidth={4} />
                          </span>
                      )}
                  </div>
                </div>
              );
          })}

          {isAdding ? (
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mt-4 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
              <input
                autoFocus
                type="text"
                placeholder="Name..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none mb-3 placeholder:text-slate-400 dark:text-white"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex gap-2 mb-3 flex-wrap">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={clsx(
                      "w-4 h-4 rounded-full transition-transform hover:scale-110",
                      selectedColor === c ? "ring-2 ring-slate-400 scale-110" : "opacity-70"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAdd}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Fertig
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Abbruch
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full mt-4 flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800/50 transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Neues Ziel
            </button>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
           <div className="flex justify-between items-center px-2">
              <IconButton icon={Settings} onClick={() => setActiveModal('settings')} title="Einstellungen" active={activeModal === 'settings'} />
              <IconButton icon={BarChart2} onClick={() => setActiveModal('stats')} title="Statistiken" active={activeModal === 'stats'} />
              <IconButton icon={Info} onClick={() => setActiveModal('info')} title="Über die Seinfeld-Methode" active={activeModal === 'info'} />
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <IconButton icon={isDark ? Sun : Moon} onClick={toggleTheme} title={isDark ? "Light Mode" : "Dark Mode"} />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/json" />
              <IconButton icon={CircleHelp} onClick={() => setActiveModal('help')} title="Hilfe" active={activeModal === 'help'} />
           </div>
        </div>
      </div>

      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={getModalTitle()}
      >
          {activeModal === 'stats' && activeHabit && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: activeHabit.color }}
                />
                <h3 className="text-xl font-bold dark:text-white">{activeHabit.name}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                      <Flame size={16} className="text-orange-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Aktueller Streak</span>
                   </div>
                   <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {streaks[activeHabit.id] || 0} 
                      <span className="text-sm text-slate-400 font-medium ml-1">Tage</span>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                      <Activity size={16} className="text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Jahresquote</span>
                   </div>
                   <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {calculateCompletionRate(activeHabit)} 
                      <span className="text-sm text-slate-400 font-medium ml-1">%</span>
                   </div>
                </div>

                <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                      <Check size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Gesamt erledigt</span>
                   </div>
                   <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {activeHabit.completedDates.length} 
                      <span className="text-sm text-slate-400 font-medium ml-1">Tage</span>
                   </div>
                   <p className="text-xs text-slate-400 mt-2">
                     Insgesamt seit dem {format(new Date(activeHabit.createdAt), 'dd.MM.yyyy')}
                   </p>
                </div>
              </div>
            </div>
          )}
          
          {activeModal === 'stats' && !activeHabit && (
            <div className="text-center text-slate-500 py-8">
              Bitte wähle ein Ziel aus, um Statistiken zu sehen.
            </div>
          )}

          {activeModal === 'settings' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Verwalte deine App-Daten. Du kannst deine Ziele exportieren, um ein Backup zu erstellen, oder sie auf einem anderen Gerät importieren.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={onExport} className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                  <Download size={16} /> Backup erstellen
                </button>
                <button onClick={handleImportClick} className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                  <Upload size={16} /> Backup laden
                </button>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                 <p className="text-xs text-slate-400 text-center">Version v0.5.0</p>
              </div>
            </div>
          )}

          {activeModal === 'info' && (
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p className="font-medium">"Don't Break the Chain"</p>
              <p className="text-sm leading-relaxed">
                Diese Methode geht auf den Comedian Jerry Seinfeld zurück. Sein Erfolgsrezept für Produktivität war simpel:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-2 marker:text-emerald-500">
                <li>Nimm dir ein großes Ziel vor (z.B. Witze schreiben).</li>
                <li>Arbeite <strong>jeden Tag</strong> daran.</li>
                <li>Markiere jeden erfolgreichen Tag mit einem roten Kreuz im Kalender.</li>
                <li>Nach ein paar Tagen entsteht eine visuelle Kette.</li>
              </ul>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                Dein einziger Job ist es jetzt, die Kette nicht abreißen zu lassen!
              </p>

              <div className="pt-6 mt-2 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex flex-col gap-2 text-xs text-slate-400">
                    <div className="flex justify-between">
                        <span>Version</span>
                        <span className="font-mono font-medium text-slate-600 dark:text-slate-300">v0.5.0</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Credits</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">blkrk4000 & Gemini AI</span>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeModal === 'help' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Maus</h3>
                <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <MousePointer size={16} className="mt-0.5 text-emerald-500" />
                  <span>Klicke auf einen Tag im Kalender, um ihn als "Erledigt" zu markieren.</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tastatur (Power User)</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-900 dark:text-white">Bereich wechseln</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs font-mono">TAB</kbd>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Sidebar umschalten</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs font-mono">Ctrl + Shift + S</kbd>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Ziel wechseln (Wenn Sidebar aktiv)</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs font-mono">↑ / ↓</kbd>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Kalender navigieren</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs font-mono">Pfeiltasten</kbd>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Tag umschalten</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs font-mono">Space / Enter</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
      </Modal>
    </>
  );
};