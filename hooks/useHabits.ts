import { useState, useEffect, useMemo } from 'react';
import { Habit } from '../types';
import { calculateStreakForHabit, DEFAULT_HABITS } from '../utils/habitUtils';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('seinfeld-habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  useEffect(() => {
    localStorage.setItem('seinfeld-habits', JSON.stringify(habits));
  }, [habits]);

  const streaks = useMemo(() => {
    const result: { [id: string]: number } = {};
    habits.forEach(h => {
        result[h.id] = calculateStreakForHabit(h);
    });
    return result;
  }, [habits]);

  const addHabit = (newHabitData: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: crypto.randomUUID(),
      completedDates: [],
      createdAt: new Date().toISOString(),
      archived: false
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit.id;
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const toggleArchive = (id: string) => {
    setHabits(prev => prev.map(h => 
       h.id === id ? { ...h, archived: !h.archived } : h
    ));
  };

  const renameHabit = (id: string, newName: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name: newName } : h));
  };

  const reorderHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
  };

  const toggleDate = (habitId: string, dateStr: string) => {
    setHabits(currentHabits => {
        return currentHabits.map(h => {
            if (h.id === habitId) {
                 const isCompleted = h.completedDates.includes(dateStr);
                 const newDates = isCompleted 
                    ? h.completedDates.filter(d => d !== dateStr)
                    : [...h.completedDates, dateStr];
                 return { ...h, completedDates: newDates };
            }
            return h;
        });
    });
  };

  const importHabits = (file: File, callback?: (success: boolean) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const parsed = JSON.parse(result);
          if (Array.isArray(parsed) && parsed.every(h => h.id && h.name && Array.isArray(h.completedDates))) {
             setHabits(parsed);
             if (callback) callback(true);
          } else {
             if (callback) callback(false);
          }
        }
      } catch (e) {
        if (callback) callback(false);
      }
    };
    reader.readAsText(file);
  };

  const exportHabits = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(habits));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `seinfeld_chain_tracker_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return {
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
  };
};