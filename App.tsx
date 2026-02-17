import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarGrid } from './components/CalendarGrid';
import { Habit } from './types';
import { addYears, format } from 'date-fns';
import { calculateStreakForHabit, DEFAULT_HABITS } from './utils/habitUtils';

export default function App() {
  // --- State ---
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('seinfeld-habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });
  
  const [activeHabitId, setActiveHabitId] = useState<string>(() => {
    return habits.length > 0 ? habits[0].id : '';
  });

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // 'calendar' is the default focus so users can immediately check off today
  const [focusMode, setFocusMode] = useState<'sidebar' | 'calendar'>('calendar');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('seinfeld-habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
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
          if (e.key === 'ArrowUp') {
             e.preventDefault();
             setHabits(currentHabits => {
               const idx = currentHabits.findIndex(h => h.id === activeHabitId);
               if (idx > 0) setActiveHabitId(currentHabits[idx - 1].id);
               return currentHabits;
             });
          }
          if (e.key === 'ArrowDown') {
             e.preventDefault();
             setHabits(currentHabits => {
               const idx = currentHabits.findIndex(h => h.id === activeHabitId);
               if (idx < currentHabits.length - 1) setActiveHabitId(currentHabits[idx + 1].id);
               return currentHabits;
             });
          }
          // Space to toggle TODAY on the active habit
          if (e.key === ' ') {
            e.preventDefault();
            // We need to access the latest activeHabitId here. 
            // Since we are inside useEffect with deps, we can use the state directly if added to deps,
            // or use the function passed to handlers. But here we call a handler.
            // Let's use the local helper logic here.
            
            // Note: We can't easily call handleToggleDate directly because it relies on closure state 'activeHabit' 
            // which might be stale if we don't handle deps correctly. 
            // However, activeHabitId is in the dependency array.
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            
            setHabits(currentHabits => {
                return currentHabits.map(h => {
                    if (h.id === activeHabitId) {
                         const isCompleted = h.completedDates.includes(todayStr);
                         const newDates = isCompleted 
                            ? h.completedDates.filter(d => d !== todayStr)
                            : [...h.completedDates, todayStr];
                         return { ...h, completedDates: newDates };
                    }
                    return h;
                });
            });
          }
      }
      
      // Fallback: Global Ctrl+Arrow navigation (always works regardless of focus)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowUp') {
           e.preventDefault();
           setHabits(currentHabits => {
             const idx = currentHabits.findIndex(h => h.id === activeHabitId);
             if (idx > 0) setActiveHabitId(currentHabits[idx - 1].id);
             return currentHabits;
           });
        }
        if (e.key === 'ArrowDown') {
           e.preventDefault();
           setHabits(currentHabits => {
             const idx = currentHabits.findIndex(h => h.id === activeHabitId);
             if (idx < currentHabits.length - 1) setActiveHabitId(currentHabits[idx + 1].id);
             return currentHabits;
           });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHabitId, focusMode, isSidebarOpen]); 

  // --- Helpers ---
  const activeHabit = useMemo(() => 
    habits.find(h => h.id === activeHabitId) || habits[0]
  , [habits, activeHabitId]);

  const streaks = useMemo(() => {
    const result: { [id: string]: number } = {};
    habits.forEach(h => {
        result[h.id] = calculateStreakForHabit(h);
    });
    return result;
  }, [habits]);

  // --- Handlers ---
  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: crypto.randomUUID(),
      completedDates: [],
      createdAt: new Date().toISOString()
    };
    setHabits([...habits, newHabit]);
    setActiveHabitId(newHabit.id);
  };

  const handleDeleteHabit = (id: string) => {
    if (!confirm('Wirklich löschen?')) return;
    const newHabits = habits.filter(h => h.id !== id);
    setHabits(newHabits);
    if (activeHabitId === id && newHabits.length > 0) {
      setActiveHabitId(newHabits[0].id);
    }
  };

  const handleToggleDate = (dateStr: string) => {
    if (!activeHabit) return;

    const isCompleted = activeHabit.completedDates.includes(dateStr);
    let newDates;

    if (isCompleted) {
      newDates = activeHabit.completedDates.filter(d => d !== dateStr);
    } else {
      newDates = [...activeHabit.completedDates, dateStr];
    }

    const updatedHabit = { ...activeHabit, completedDates: newDates };
    setHabits(habits.map(h => h.id === activeHabit.id ? updatedHabit : h));
  };

  const handleToggleTheme = () => setIsDark(!isDark);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(habits));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `seinfeld_habits_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const parsed = JSON.parse(result);
          if (Array.isArray(parsed) && parsed.every(h => h.id && h.name && Array.isArray(h.completedDates))) {
             setHabits(parsed);
             if (parsed.length > 0) setActiveHabitId(parsed[0].id);
             alert('Daten erfolgreich importiert!');
          } else {
             alert('Ungültiges Dateiformat.');
          }
        }
      } catch (e) {
        alert('Fehler beim Lesen der Datei.');
      }
    };
    reader.readAsText(file);
  };

  const handleSidebarSelect = (id: string) => {
    setActiveHabitId(id);
    setFocusMode('sidebar'); // Switch focus to sidebar when clicking an item
  };

  // --- Render ---
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
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
            streaks={streaks}
            toggleTheme={handleToggleTheme}
            isDark={isDark}
            onExport={handleExport}
            onImport={handleImport}
            isFocused={focusMode === 'sidebar'}
         />
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col h-full overflow-hidden relative"
        onClick={() => setFocusMode('calendar')} // Click on main area gives it focus
      >
        {activeHabit ? (
          <CalendarGrid 
            habit={activeHabit}
            onToggleDate={handleToggleDate}
            currentDate={currentDate}
            onPrevYear={() => setCurrentDate(addYears(currentDate, -1))}
            onNextYear={() => setCurrentDate(addYears(currentDate, 1))}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            isFocused={focusMode === 'calendar'}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Erstelle ein Ziel, um zu beginnen.
          </div>
        )}
      </div>
    </div>
  );
}