import React, { useState, useRef, useEffect } from 'react';
import { Settings, BarChart2, CircleHelp, Palette, Info, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { ModalType } from '../Sidebar';
import { ThemeOption } from '../../types';

interface SidebarFooterProps {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  activeModal,
  setActiveModal,
  isDark,
  toggleTheme,
  currentTheme,
  setTheme
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
            setShowThemeMenu(false);
        }
    };
    if (showThemeMenu) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThemeMenu]);

  const IconButton = ({ icon: Icon, onClick, title, active, badge }: { icon: any, onClick: () => void, title: string, active?: boolean, badge?: string }) => (
    <button 
      onClick={onClick}
      title={title}
      className={clsx(
        "relative p-2 rounded-lg transition-all duration-200",
        active 
          ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white"
          : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
    >
      <Icon size={18} strokeWidth={2} />
      {badge && (
        <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded-full bg-emerald-500 text-white leading-tight">{badge}</span>
      )}
    </button>
  );

  const ThemeItem = ({ id, label, colorDot }: { id: ThemeOption, label: string, colorDot: string }) => (
      <button 
        onClick={() => {
            setTheme(id);
        }}
        className={clsx(
            "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
            currentTheme === id 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
      >
        <div className="flex items-center gap-3">
            <span className={clsx("w-3 h-3 rounded-full border border-slate-200 dark:border-slate-600", colorDot)}></span>
            {label}
        </div>
        {currentTheme === id && <Check size={14} className="text-emerald-500" />}
      </button>
  );

  return (
    <div className="relative p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
       
       {/* Theme Popover Menu */}
       {showThemeMenu && (
           <div 
             ref={themeMenuRef}
             className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 animate-in fade-in slide-in-from-bottom-2 z-50 origin-bottom"
           >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Design</span>
              </div>
              
              <div className="space-y-1 py-1">
                 <ThemeItem id="default" label="Standard (Slate)" colorDot="bg-slate-500" />
                 <ThemeItem id="gruvbox" label="Gruvbox" colorDot="bg-[#d79921]" />
                 <ThemeItem id="eink" label="E-Ink (Papier)" colorDot="bg-[#525252]" />
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
              
              <div className="flex items-center justify-between px-3 py-2">
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dunkelmodus</span>
                 <button 
                    onClick={toggleTheme}
                    title={isDark ? 'Zum hellen Modus wechseln' : 'Zum Dunkelmodus wechseln'}
                    className={clsx(
                        "w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none",
                        isDark ? "bg-emerald-500" : "bg-slate-300"
                    )}
                 >
                    <div className={clsx(
                        "absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300",
                        isDark ? "left-6" : "left-1"
                    )} />
                 </button>
              </div>
           </div>
       )}

       <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-xl p-1.5 border border-slate-100 dark:border-slate-800">
          <IconButton icon={Settings} onClick={() => setActiveModal('settings')} title="Einstellungen" active={activeModal === 'settings'} />
          <IconButton icon={BarChart2} onClick={() => setActiveModal('stats')} title="Statistiken" active={activeModal === 'stats'} />
          
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          
          <IconButton 
            icon={Palette} 
            onClick={() => setShowThemeMenu(!showThemeMenu)} 
            title="Design & Theme" 
            active={showThemeMenu}
          />
          
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          
          <IconButton icon={Info} onClick={() => setActiveModal('info')} title="Info" active={activeModal === 'info'} />
          <IconButton icon={CircleHelp} onClick={() => setActiveModal('help')} title="Hilfe" active={activeModal === 'help'} />
       </div>
    </div>
  );
};