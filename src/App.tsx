import { useState, useEffect, useCallback } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import ThemeToggle from './ThemeToggle';
import { FontToggle } from './FontToggle';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./App.css";
import "./Sidebar";
import { PartialBlock } from "@blocknote/core";

import { SuggestionMenuController } from "@blocknote/react";
import { invoke } from '@tauri-apps/api/tauri';
import Sidebar from './Sidebar';
import SaveNotification from './SaveNotification';

const fonts = [
  { name: 'Default', label: '默认', value: 'var(--font-default)' },
  { name: 'Kai', label: '楷体', value: 'var(--font-kai)' },
  { name: 'ImitationSong', label: '仿宋', value: 'var(--font-imitationsong)' },
  { name: 'Song', label: '宋体', value: 'var(--font-song)' },
];

// 定义一个扩展的 Theme 类型，确保包含 fontFamily
interface ExtendedTheme extends Theme {
  fontFamily: string;
}

interface FrontendWave {
  id: string;
  name: string;
  type: 'wave';
}

interface FrontendCluster {
  id: string;
  name: string;
  type: 'cluster';
  children: FrontendWave[];
}

interface FrontendOrigin {
  id: string;
  name: string;
  type: 'origin';
  children: FrontendCluster[];
}

const defaultFontFamily = 'var(--font-default)';

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
  fontFamily: defaultFontFamily,
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
  fontFamily: defaultFontFamily,
};

type ThemeMode = 'light' | 'dark';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentTheme] = useState<ExtendedTheme>(darkTheme as ExtendedTheme);
  const [currentFont, setCurrentFont] = useState(fonts[0].name);
  const [sidebarData, setSidebarData] = useState<FrontendOrigin[]>([]);
  const [error] = useState<string | null>(null);
  const [currentWaveId, setCurrentWaveId] = useState<string | null>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const isDarkMode = 
        themeMode === 'dark';
      
      setCurrentTheme(prevTheme => ({
        ...(isDarkMode ? darkTheme : lightTheme),
        fontFamily: prevTheme.fontFamily || defaultFontFamily,
      }));
    };
  
    updateTheme();
  
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(updateTheme);
  
    return () => mediaQuery.removeListener(updateTheme);
  }, [themeMode]);
  
  useEffect(() => {
    setCurrentTheme(prevTheme => ({
      ...prevTheme,
      fontFamily: fonts.find(font => font.name === currentFont)?.value || defaultFontFamily
    }));
  }, [currentFont]);

  const fetchInitialData = useCallback(async () => {
    try {
      const data = await invoke('get_initial_data') as FrontendOrigin[];
      setSidebarData(data);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "heading",
        content: "Hello! Luwav",
      },
      {
        type: "paragraph",
        content: "这里是欢迎界面"
      }
    ],
    // resolveFileUrl: async (url: string) => {
    //   try {
    //     const response = await fetch(url);
    //     const blob = await response.blob();
    //     const file = new File([blob], "image.jpg", { type: blob.type });
    //     const fileBuffer = await file.arrayBuffer();
    //     const fileArray = new Uint8Array(fileBuffer);
    //     const relativePath = await invoke('upload_and_backup_file', { 
    //       file: Array.from(fileArray),
    //       fileName: file.name
    //     }) as string;
    //     console.log(`File uploaded successfully. Relative path: ${relativePath}`);
  
    //     // 使用 convertFileSrc 将相对路径转换为可用的 URL
    //     const url_ = convertFileSrc(relativePath);
    //     console.log(`Converted URL: ${url_}`);
        
    //     // 尝试加载图片
    //     const img = new Image();
    //     img.onload = () => console.log("Image loaded successfully");
    //     img.onerror = (e) => console.error("Error loading image:", e);
    //     img.src = url_;
  
    //     return url_;
    //   } catch (error) {
    //     console.error('Error saving image:', error);
    //     throw error;
    //   }
    // },
  
  });

  const handleSave = useCallback(async () => {
    if (currentWaveId === null) {
      console.warn('保存失败: 现在没有打开Wave');
      return;
    }

    try {
      const content = editor.topLevelBlocks;
      await invoke('update_wave', {
        id: Number(currentWaveId),
        newContent: content
      });
      console.log("保存成功");
      setShowSaveNotification(true);
    } catch (error) {
      console.error("保存失败")
    }
  }, [currentWaveId, editor])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();  // 这个是不想让浏览器默认保存，不过桌面端无所谓了
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  const handleWaveSelect = useCallback(async (waveId: string) => {
    try {
      const jsonData = await invoke('get_json_file', { id: Number(waveId) }) as PartialBlock[];
      console.log(jsonData);
      
      editor.replaceBlocks(editor.topLevelBlocks, jsonData);
      setCurrentWaveId(waveId);
    } catch (error) {
      console.error('Wave文件获取失败: ', error);
    }
  }, [editor]);


  if (error) {
    return (
      <div>
        Error: {error}
        <button onClick={fetchInitialData}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className={`app-container ${themeMode}`}>
      <div className="controls">
        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
        <FontToggle currentFont={currentFont} setCurrentFont={setCurrentFont} fonts={fonts} />
      </div>
      <div className="main-content">
        <Sidebar 
          data={sidebarData} 
          onDataChange={setSidebarData}
          refreshData={fetchInitialData}
          onWaveSelect={handleWaveSelect}
        />
        <div className="subtle-ocean-editor">
          <BlockNoteView 
            editor={editor} 
            theme={currentTheme} 
            data-font={currentFont}
            slashMenu={false}
          >
            <SuggestionMenuController
              triggerCharacter={"/"}
            />
          </BlockNoteView>
          <div>
            <SaveNotification
              isVisible={showSaveNotification}
              onHide={() => setShowSaveNotification(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}