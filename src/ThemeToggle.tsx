import React, { useState, useEffect } from 'react';
import { Moon, Sun } from "lucide-react";

type ThemeMode = 'light' | 'dark';

interface ThemeToggleProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ themeMode, setThemeMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return <Sun className="icon" />;
      case 'dark': return <Moon className="icon" />;
    }
  };

  useEffect(() => {
    // 当主题改变时，短暂展开显示所有按钮
    setIsExpanded(true);
    const timer = setTimeout(() => setIsExpanded(false), 2000);
    return () => clearTimeout(timer);
  }, [themeMode]);

  return (
    <div 
      className={`theme-toggle ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <button 
        onClick={() => setThemeMode('light')} 
        className={themeMode === 'light' ? 'active' : ''}
      >
        <Sun className="icon" />
      </button>
      <button 
        onClick={() => setThemeMode('dark')} 
        className={themeMode === 'dark' ? 'active' : ''}
      >
        <Moon className="icon" />
      </button>
    </div>
  );
};

export default ThemeToggle;