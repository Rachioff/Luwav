import { useState, useEffect, useCallback, useRef } from 'react';
import { createReactInlineContentSpec, DefaultReactSuggestionItem, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import ThemeToggle from './ThemeToggle';
import { FontToggle } from './FontToggle';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./App.css";
import "./Sidebar";
import { PartialBlock, BlockNoteSchema, defaultInlineContentSpecs, defaultBlockSpecs, filterSuggestionItems } from "@blocknote/core";

import { SuggestionMenuController } from "@blocknote/react";
import { invoke, convertFileSrc } from '@tauri-apps/api/tauri';
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
  const [currentTheme, setCurrentTheme] = useState<ExtendedTheme>(lightTheme as ExtendedTheme);
  const [currentFont, setCurrentFont] = useState(fonts[0].name);
  const [sidebarData, setSidebarData] = useState<FrontendOrigin[]>([]);
  const [error] = useState<string | null>(null);
  const [currentWaveId, setCurrentWaveId] = useState<string>('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // 侧边栏是否折叠
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const [previousWaveId, setPreviousWaveId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  // const [wordCount, setWordCount] = useState(0);

  // 使用 useRef 来存储当前值
  const currentWaveIdRef = useRef(currentWaveId);
  const previousWaveIdRef = useRef(previousWaveId);

  // 更新 ref 和 state
  const updateCurrentWaveId = (newId: string) => {
    currentWaveIdRef.current = newId;
    setCurrentWaveId(newId);
  };

  const updatePreviousWaveId = (newId: string | null) => {
    previousWaveIdRef.current = newId;
    setPreviousWaveId(newId);
  };

  const toggleSidebar = () => {  // 切换侧边栏
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await invoke('get_settings') as [string, string];
        setThemeMode(settings[0] as ThemeMode);
        setCurrentFont(settings[1]);
      } catch (error) {
        console.error('Failed to load settings:', error);
        // 如果加载失败，保持默认值
      } finally {
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      if (isInitialized) {
        try {
          await invoke('save_settings', { theme: themeMode, font: currentFont });
        } catch (error) {
          console.error('Failed to save settings:', error);
        }
      }
    };
    saveSettings();
  }, [themeMode, currentFont, isInitialized]);

  useEffect(() => {
    const isDarkMode = themeMode === 'dark';
    setCurrentTheme(prevTheme => ({
      ...(isDarkMode ? darkTheme : lightTheme),
      fontFamily: prevTheme.fontFamily || defaultFontFamily,
    }));
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

  const WaveLink = createReactInlineContentSpec(
    {
      type: "waveLink",
      propSchema: {
        targetWaveId: {
          default: "",
        },
        targetWaveName: {
          default: "",
        },
        sourceWaveId: {
          default: "",
        },
      },
      content: "none",
    },
    {
      render: ({ inlineContent }) => (
        <span
          style={{
            color: "#1a73e8",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => handleWaveLinkClick(inlineContent.props)}
        >
          {inlineContent.props.targetWaveName}
        </span>
      ),
    }
  );
  
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
    },
    inlineContentSpecs: {
      ...defaultInlineContentSpecs,
      waveLink: WaveLink,
    },
  });

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
    uploadFile: async (file: File) => {
      try {
        console.log(`Uploading file: ${file.name}`);
        const fileBuffer = await file.arrayBuffer();
        const fileArray = new Uint8Array(fileBuffer);
        
        const relativePath = await invoke('upload_and_backup_file', { 
          file: Array.from(fileArray),
          fileName: file.name
        }) as string;
  
        console.log(`File uploaded successfully. Relative path: ${relativePath}`);
  
        // 使用 convertFileSrc 将相对路径转换为可用的 URL
        const url = convertFileSrc(relativePath);
        console.log(`Converted URL: ${url}`);
  
        return url;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    },
    schema,
  });

  const handleSave = useCallback(async () => {
    if (currentWaveId === null) {
      console.warn('保存失败: 现在没有打开Wave');
    } else {
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
    }
  }, [currentWaveId, editor])

  useEffect(() => {
    const saveInterval = setInterval(() => {
      handleSave();
    }, 60000);  // 一分钟自动保存一次

    return () => {
      clearInterval(saveInterval);
    };
  }, [handleSave]);

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

  if (error) {
    return (
      <div>
        Error: {error}
        <button onClick={fetchInitialData}>Retry</button>
      </div>
    );
  }

    // 更新面包屑
    const updateBreadcrumb = useCallback((waveId: string) => {
      const origin = sidebarData.find(o => o.children.some(c => c.children.some(w => w.id === waveId)));
      const cluster = origin?.children.find(c => c.children.some(w => w.id === waveId));
      const wave = cluster?.children.find(w => w.id === waveId);
  
      if (origin && cluster && wave) {
        setBreadcrumb([origin.name, cluster.name, wave.name]);
      }
    }, [sidebarData]);
  
    // // 更新字数统计
    // const extractTextFromBlocks = (blocks: Block[]): string => {
    //   return blocks.map(block => {
    //     if (block.content && Array.isArray(block.content)) {
    //       return block.content.map(item => {
    //         // 根据实际情况处理 item
    //         if (typeof item === 'string') {
    //           return item;
    //         } else if ('type' in item && 'text' in item) {
    //           return item.text;
    //         }
    //         return '';
    //       }).join('');
    //     }
    //     return '';
    //   }).join('\n').trim();
    // };
    
    // const updateWordCount = useCallback(() => {
    //   const textContent = extractTextFromBlocks(editor.topLevelBlocks);
      
    //   // 计算单词数和字符数
    //   // 英文单词用正则表达式匹配
    //   const wordCount = (textContent.match(/\b\w+\b/g) || []).length;
      
    //   // 计算中文字符数
    //   const chineseCharCount = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length;
      
    //   // 将两者合计为总字数
    //   const totalCount = wordCount + chineseCharCount;
      
    //   setWordCount(totalCount);
    // }, [editor]);
    
    // useEffect(() => {
    //   updateWordCount();  // 初始化时调用一次字数统计
      
    //   // 使用类型断言来确保 unsubscribe 是一个函数
    //   const unsubscribe = editor.onEditorContentChange(updateWordCount) as (() => void) | undefined;
    
    //   return () => {
    //     if (typeof unsubscribe === 'function') {
    //       unsubscribe();  // 确保 unsubscribe 是一个函数
    //     }
    //   };
    // }, [editor, updateWordCount]);
    
    const handleWaveSelect = useCallback(async (waveId: string) => {
      try {
        const jsonData = await invoke('get_json_file', { id: Number(waveId) }) as PartialBlock[];
        editor.replaceBlocks(editor.topLevelBlocks, jsonData);
        updateCurrentWaveId(waveId);
        updateBreadcrumb(waveId);
        // updateWordCount();
      } catch (error) {
        console.error('Wave文件获取失败: ', error);
      }
    }, [editor, updateBreadcrumb]);

    const handleWaveLinkClick = useCallback((props: { targetWaveId: string, sourceWaveId: string }) => {
      updatePreviousWaveId(currentWaveIdRef.current);
      handleWaveSelect(props.targetWaveId);
    }, [currentWaveId, handleWaveSelect]);

    const getWaveLinkItems = useCallback((editor: typeof schema.BlockNoteEditor): DefaultReactSuggestionItem[] => {
      return sidebarData.flatMap(origin => 
        origin.children.flatMap(cluster => 
          cluster.children.map(wave => ({
            title: wave.name,
            onItemClick: () => {
              editor.insertInlineContent([
                {
                  type: "waveLink",
                  props: {
                    targetWaveId: wave.id,
                    targetWaveName: wave.name,
                    sourceWaveId: currentWaveId,
                  },
                },
                " ", // 在 WaveLink 后添加一个空格
              ]);
            },
          }))
        )
      );
    }, [sidebarData, currentWaveId]);
  
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
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
          <div className="editor-container">
            <div className="header-bar">
              <div className="breadcrumb">{breadcrumb.join(' > ')}</div>
              {/* <div className="word-count">字数: {wordCount}</div> */}
              {previousWaveId && (
                <button onClick={() => handleWaveSelect(previousWaveId)}>返回上一个Wave</button>
              )}
            </div>
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
                  <SuggestionMenuController
                    triggerCharacter='@'
                    getItems={async (query) =>
                      filterSuggestionItems(getWaveLinkItems(editor), query)
                    }
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
      </div>
    );
  }