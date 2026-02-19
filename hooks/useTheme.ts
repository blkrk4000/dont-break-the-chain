import { useState, useEffect } from 'react';
import { ThemeOption } from '../types';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme-mode') === 'dark' || 
             (!localStorage.getItem('theme-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [theme, setTheme] = useState<ThemeOption>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme-style') as ThemeOption) || 'default';
    }
    return 'default';
  });

  // Handle Dark/Light Mode Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme-mode', 'light');
    }
  }, [isDark]);

  // Handle Color Theme Data Attribute
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme-style', theme);
  }, [theme]);

  const toggleTheme = () => setIsDark(!isDark);
  
  return { isDark, toggleTheme, theme, setTheme };
};