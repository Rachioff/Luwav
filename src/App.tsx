import { useState, useEffect } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import ThemeToggle from './ThemeToggle';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./App.css";

const lightTheme: Theme = {
  colors: {
    editor: {
      text: "#37474F",
      background: "#FAFBFC",
    },
    menu: {
      text: "#37474F",
      background: "#F5F7F9",
    },
    tooltip: {
      text: "#546E7A",
      background: "#FAFBFC",
    },
    hovered: {
      text: "#37474F",
      background: "#EEF2F6",
    },
    selected: {
      text: "#FAFBFC",
      background: "#78909C",
    },
    disabled: {
      text: "#B0BEC5",
      background: "#F5F7F9",
    },
    shadow: "rgba(84, 110, 122, 0.1)",
    border: "#ECEFF1",
    sideMenu: "#EEF2F6",
  },
  borderRadius: 6,
  fontFamily: "'Inter', sans-serif",
};

const darkTheme: Theme = {
  colors: {
    editor: {
      text: "#E0E0E0",
      background: "#263238",
    },
    menu: {
      text: "#E0E0E0",
      background: "#37474F",
    },
    tooltip: {
      text: "#FAFBFC",
      background: "#546E7A",
    },
    hovered: {
      text: "#FAFBFC",
      background: "#455A64",
    },
    selected: {
      text: "#FAFBFC",
      background: "#607D8B",
    },
    disabled: {
      text: "#78909C",
      background: "#37474F",
    },
    shadow: "rgba(0, 0, 0, 0.3)",
    border: "#455A64",
    sideMenu: "#37474F",
  },
  borderRadius: 6,
  fontFamily: "'Inter', sans-serif",
};

type ThemeMode = 'light' | 'dark' | 'system';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    const updateTheme = () => {
      const isDarkMode = 
        themeMode === 'dark' || 
        (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      setCurrentTheme(isDarkMode ? darkTheme : lightTheme);
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(updateTheme);

    return () => mediaQuery.removeListener(updateTheme);
  }, [themeMode]);

  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "heading",
        content: "Welcome to Your Adaptive Ocean-Inspired Editor",
      },
      {
        type: "paragraph",
        content: "This space adapts to your preference: light as a sunny beach, dark as the deep sea, or in harmony with your system."
      }
    ]
  });

  return (
    <div className={`app-container ${themeMode}`}>
      <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
      <div className="subtle-ocean-editor">
        <BlockNoteView editor={editor} theme={currentTheme} />
      </div>
    </div>
  );
}