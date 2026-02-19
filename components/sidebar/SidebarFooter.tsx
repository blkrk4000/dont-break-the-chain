import React from 'react';
import { Settings, BarChart2, Moon, Sun, CircleHelp, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { ModalType } from '../Sidebar';

interface SidebarFooterProps {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  activeModal,
  setActiveModal,
  isDark,
  toggleTheme
}) => {

  const IconButton = ({ icon: Icon, onClick, title, active }: { icon: any, onClick: () => void, title: string, active?: boolean }) => (
    <button 
      onClick={onClick}
      title={title}
      className={clsx(
        "p-2 rounded-lg transition-all duration-200",
        active 
          ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white"
          : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );

  return (
    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
       <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-xl p-1.5 border border-slate-100 dark:border-slate-800">
          <IconButton icon={Settings} onClick={() => setActiveModal('settings')} title="Einstellungen" active={activeModal === 'settings'} />
          <IconButton icon={BarChart2} onClick={() => setActiveModal('stats')} title="Statistiken" active={activeModal === 'stats'} />
          <IconButton icon={Info} onClick={() => setActiveModal('info')} title="Über die Methode" active={activeModal === 'info'} />
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <IconButton icon={isDark ? Sun : Moon} onClick={toggleTheme} title={isDark ? "Light Mode" : "Dark Mode"} />
          <IconButton icon={CircleHelp} onClick={() => setActiveModal('help')} title="Hilfe" active={activeModal === 'help'} />
       </div>
    </div>
  );
};