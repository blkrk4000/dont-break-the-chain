import React, { useState, useRef } from 'react';
import { Activity, Settings, Info, Download, Upload, CircleHelp, Check, MousePointer, Flame, BarChart2, GripVertical, FileJson } from 'lucide-react';
import { Habit, ThemeOption } from '../types';
import { format } from 'date-fns';
import { Modal } from './Modal';
import { HelpContent } from './HelpContent';
import { calculateCompletionRate } from '../utils/habitUtils';

// Sub-Components
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarHabitList } from './sidebar/SidebarHabitList';
import { SidebarFooter } from './sidebar/SidebarFooter';

interface SidebarProps {
  habits: Habit[];
  activeHabitId: string | null;
  onSelectHabit: (id: string | null) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  onDeleteHabit: (id: string) => void;
  onRenameHabit: (id: string, newName: string) => void;
  onReorderHabits: (habits: Habit[]) => void;
  onToggleArchive: (id: string) => void;
  streaks: { [id: string]: number };
  toggleTheme: () => void;
  isDark: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  isFocused: boolean;
  onClose: () => void;
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
}

export type ModalType = 'settings' | 'info' | 'help' | 'stats' | null;

export const Sidebar: React.FC<SidebarProps> = ({ 
  habits, 
  activeHabitId, 
  onSelectHabit, 
  onAddHabit, 
  onDeleteHabit,
  onRenameHabit,
  onReorderHabits,
  onToggleArchive,
  streaks,
  toggleTheme,
  isDark,
  onExport,
  onImport,
  isFocused,
  onClose,
  currentTheme,
  setTheme
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeHabit = habits.find(h => h.id === activeHabitId);
  const APP_VERSION = "v1.0.0";

  const getModalTitle = () => {
    switch (activeModal) {
      case 'settings': return <><Settings size={20} className="text-slate-400" /> Einstellungen</>;
      case 'info': return <><Info size={20} className="text-slate-400" /> Die Methode</>;
      case 'help': return <><CircleHelp size={20} className="text-slate-400" /> Hilfe & Shortcuts</>;
      case 'stats': return <><BarChart2 size={20} className="text-slate-400" /> Statistik</>;
      default: return null;
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <>
      <div className="w-full h-full bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl text-slate-900 dark:text-slate-100 flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-xl z-20">
        
        <SidebarHeader onDashboardClick={() => onSelectHabit(null)} onClose={onClose} />

        <SidebarHabitList 
          habits={habits}
          activeHabitId={activeHabitId}
          onSelectHabit={onSelectHabit}
          onAddHabit={onAddHabit}
          onDeleteHabit={onDeleteHabit}
          onRenameHabit={onRenameHabit}
          onReorderHabits={onReorderHabits}
          onToggleArchive={onToggleArchive}
          streaks={streaks}
          isFocused={isFocused}
        />

        <SidebarFooter 
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          isDark={isDark}
          toggleTheme={toggleTheme}
          currentTheme={currentTheme}
          setTheme={setTheme}
        />
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
               <p>Wähle ein Ziel aus oder gehe zum Dashboard.</p>
            </div>
          )}

          {activeModal === 'settings' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                      <FileJson size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Datensicherung</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Exportiere deine Daten als Backup oder importiere einen Spielstand.</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={onExport} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium transition-all hover:shadow-md group">
                    <Download size={24} className="text-slate-400 group-hover:text-emerald-500 transition-colors" /> 
                    <span>Backup speichern</span>
                  </button>
                  
                  <button onClick={handleImportClick} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium transition-all hover:shadow-md group">
                    <Upload size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" /> 
                    <span>Backup laden</span>
                  </button>
                  
                  {/* Hidden Input for Import */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="application/json" 
                  />
                </div>
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
                        <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{APP_VERSION}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Lizenz</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">MIT License</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Credits</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">blkrk4000 & Gemini AI</span>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeModal === 'help' && <HelpContent />}
      </Modal>
    </>
  );
};