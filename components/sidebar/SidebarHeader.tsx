import React from 'react';
import { X } from 'lucide-react';

interface SidebarHeaderProps {
  onDashboardClick: () => void;
  onClose: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onDashboardClick, onClose }) => {
  return (
    <div className="p-6 flex-none border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
      <button onClick={onDashboardClick} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity focus:outline-none flex-1" title="Zum Dashboard">
         {/* Logo with Glow Effect */}
         <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <svg className="relative w-8 h-8 drop-shadow-sm" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" className="fill-emerald-500" />
                <path d="M8 17L14 23L24 9" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         </div>
         
         <div className="flex flex-col justify-center">
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              Chain<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Tracker</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-0.5">
              Jerry Seinfeld's
            </span>
         </div>
      </button>

      {/* Close Button for Mobile */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onClose();
        }}
        className="md:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
};