import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarGrid } from './components/CalendarGrid';
import { Dashboard } from './components/Dashboard';
import { Habit } from './types';
import { addYears, format } from 'date-fns';
import { PanelLeft } from 'lucide-react';
import { useHabits } from './hooks/useHabits';
import { useTheme } from './hooks/useTheme';

export default function App() {
  // --- Hooks ---
  const { 
    habits, 
    streaks, 
    addHabit, 
    deleteHabit, 
    toggleArchive, 
    renameHabit, 
    reorderHabits, 
    toggleDate, 
    importHabits, 
    exportHabits 
  } = useHabits();
  
  const { isDark, toggleTheme, theme, setTheme } = useTheme();

  // --- UI State ---
  // activeHabitId is now string | null. Null means "Show Dashboard".
  const [activeHabitId, setActiveHabitId] = useState<string | null>(() => {
    if (habits.length === 0) return null;
    // Default to the first active habit, or null if none
    const active = habits.find(h => !h.archived);
    return active ? active.id : null;
  });

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  
  const [isSidebarOpen, setSidebarOpen] = useState(() => {
     if (typeof window !== 'undefined') {
       return window.innerWidth >= 768; // Start closed on mobile, open on desktop
     }
     return true;
  });
  
  // 'calendar' includes dashboard view logic when activeHabitId is null
  const [focusMode, setFocusMode] = useState<'sidebar' | 'calendar'>('calendar');

  // --- Effects ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      // ESC: Always go to Dashboard (if not already there)
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeHabitId !== null) {
            setActiveHabitId(null);
            setFocusMode('calendar'); // Focus the dashboard
        }
        return;
      }

      // Toggle Sidebar with Ctrl+Shift+S
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
        return;
      }

      // TAB Switch Logic
      if (e.key === 'Tab') {
        e.preventDefault();
        setFocusMode(prev => prev === 'sidebar' ? 'calendar' : 'sidebar');
        // If sidebar is closed and we switch to it, open it
        if (focusMode === 'calendar' && !isSidebarOpen) {
            setSidebarOpen(true);
        }
        return;
      }

      // Navigation Logic depends on Focus Mode
      if (focusMode === 'sidebar') {
          // Get only visible habits (not archived) for navigation
          const visibleHabits = habits.filter(h => !h.archived);
          
          if (e.key === 'ArrowUp') {
             e.preventDefault();
             if (visibleHabits.length === 0) {
                 setActiveHabitId(null);
                 return;
             }
             
             if (activeHabitId === null) {
                // Already at Dashboard (top), do nothing
                return;
             }
             
             const idx = visibleHabits.findIndex(h => h.id === activeHabitId);
             if (idx === 0) {
                 // First habit -> Go up to Dashboard
                 setActiveHabitId(null);
             } else if (idx > 0) {
                 // Middle of list -> Go up
                 setActiveHabitId(visibleHabits[idx - 1].id);
             } else {
                 // Fallback if id not found
                 setActiveHabitId(null);
             }
          }

          if (e.key === 'ArrowDown') {
             e.preventDefault();
             if (visibleHabits.length === 0) return;

             if (activeHabitId === null) {
                // Dashboard -> First habit
                setActiveHabitId(visibleHabits[0].id);
             } else {
                const idx = visibleHabits.findIndex(h => h.id === activeHabitId);
                // Stop at bottom
                if (idx < visibleHabits.length - 1) setActiveHabitId(visibleHabits[idx + 1].id);
             }
          }
          
          // Space to toggle TODAY on the active habit (only if single habit selected)
          if (e.key === ' ' && activeHabitId) {
            e.preventDefault();
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            toggleDate(activeHabitId, todayStr); 
          }
          
          // Enter on Sidebar always focuses the main view
          if (e.key === 'Enter') {
             e.preventDefault();
             setFocusMode('calendar');
          }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHabitId, focusMode, isSidebarOpen, habits, toggleDate]); 

  // --- Helpers ---
  const activeHabit = useMemo(() => 
    habits.find(h => h.id === activeHabitId) || null
  , [habits, activeHabitId]);

  // --- Handlers ---
  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
    const id = addHabit(newHabitData);
    setActiveHabitId(id);
  };
  
  const handleAddHabitFromDashboard = () => {
    const id = addHabit({ name: 'Neues Ziel', color: '#10b981' });
    setActiveHabitId(id);
    setSidebarOpen(true);
  };

  const handleDeleteHabit = (id: string) => {
    if (!confirm('Wirklich endgültig löschen?')) return;
    deleteHabit(id);
    
    if (activeHabitId === id) {
      const next = habits.filter(h => h.id !== id).find(h => !h.archived);
      setActiveHabitId(next ? next.id : null);
    }
  };

  const handleToggleArchive = (id: string) => {
    toggleArchive(id);
    const targetHabit = habits.find(h => h.id === id);
    if (targetHabit && !targetHabit.archived && activeHabitId === id) {
        setActiveHabitId(null);
    }
  };

  const handleImport = (file: File) => {
    if (confirm('Dadurch werden alle aktuellen Ziele überschrieben. Fortfahren?')) {
        importHabits(file, (success) => {
            if (success) {
                alert('Daten erfolgreich importiert!');
                setActiveHabitId(null); // Reset view to dashboard
            } else {
                alert('Fehler beim Importieren der Datei.');
            }
        });
    }
  };

  const handleSidebarSelect = (id: string | null) => {
    setActiveHabitId(id);
    
    // On mobile, close sidebar after selection and focus content
    if (window.innerWidth < 768) {
       setSidebarOpen(false);
       setFocusMode('calendar'); 
    } else {
       setFocusMode('sidebar');
    }
  };

  // --- Render ---
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Sidebar */}
      <div 
        className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isSidebarOpen ? 'w-full md:w-64 opacity-100' : 'w-0 opacity-0'
        }`}
      >
         <Sidebar 
            habits={habits}
            activeHabitId={activeHabitId}
            onSelectHabit={handleSidebarSelect}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            onRenameHabit={renameHabit}
            onReorderHabits={reorderHabits}
            onToggleArchive={handleToggleArchive}
            streaks={streaks}
            toggleTheme={toggleTheme}
            isDark={isDark}
            onExport={exportHabits}
            onImport={handleImport}
            isFocused={focusMode === 'sidebar'}
            onClose={() => setSidebarOpen(false)}
            currentTheme={theme}
            setTheme={setTheme}
         />
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative"
        onClick={() => setFocusMode('calendar')} // Click to focus
      >
        {activeHabit ? (
          <CalendarGrid 
            habit={activeHabit}
            onToggleDate={(dateStr) => toggleDate(activeHabit.id, dateStr)}
            currentDate={currentDate}
            onPrevYear={() => setCurrentDate(addYears(currentDate, -1))}
            onNextYear={() => setCurrentDate(addYears(currentDate, 1))}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            isFocused={focusMode === 'calendar'}
            onToggleArchive={() => handleToggleArchive(activeHabit.id)}
            onDelete={() => handleDeleteHabit(activeHabit.id)}
          />
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             {/* Simple header for dashboard mobile toggle if sidebar closed */}
             {!isSidebarOpen && (
                <div className="flex-none p-4 border-b dark:border-slate-800 flex items-center gap-3">
                    <button 
                        onClick={() => setSidebarOpen(true)} 
                        className="p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 rounded-md transition-colors"
                    >
                        <PanelLeft size={20} />
                    </button>
                    <span className="font-bold text-lg">Dashboard</span>
                </div>
             )}
             <Dashboard 
                habits={habits}
                onSelectHabit={handleSidebarSelect}
                onToggleDate={toggleDate}
                onAddHabit={handleAddHabitFromDashboard}
                isFocused={focusMode === 'calendar'}
                onToggleArchive={handleToggleArchive}
                onDelete={handleDeleteHabit}
             />
          </div>
        )}
      </div>
    </div>
  );
}