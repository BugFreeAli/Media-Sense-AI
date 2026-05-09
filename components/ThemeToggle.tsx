import React, { useEffect, useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check local storage or system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full 
                 bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 
                 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-primary/20 
                 hover:border-primary/30 dark:hover:border-primary/50
                 transition-all duration-300 group
                 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95"
      aria-label="Toggle Theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-white/90 group-hover:text-primary transition-colors">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};