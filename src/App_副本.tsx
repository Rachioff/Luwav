'use client';

import React, { useState } from 'react';

import './App.css';
import { ThemeProvider } from "@/components/theme-provider"

import { Plate  } from '@udecode/plate-common';
import { CommentsProvider } from '@udecode/plate-comments';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { CommentsPopover } from '@/components/plate-ui/comments-popover';

import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Button } from '@/components/plate-ui/button';
import { Editor } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';

import { createPlateEditor } from '@udecode/plate-common';


import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';

import { plugins } from '@/lib/plate/plate-plugins';

import { ModeToggle } from '@/components/mode-toggle';

import initV from "@/assets/initialValue.json"
const initialValue = JSON.parse(JSON.stringify(initV));


import { nanoid } from 'nanoid';
import { useMemo } from 'react';

export function PlateEditor() {
  const [editor] = useState(() => 
    createPlateEditor({ 
      plugins,
      id: 'main-editor', // 添加一个唯一的 ID
    })
  );

  const editorId = useMemo(() => nanoid(), []); // 使用 nanoid 或其他方法生成唯一ID

  const handleSaveJson = async () => {
    try {
      const json = JSON.stringify(editor.children, null, 2);
      console.log('Serialized JSON:', json); 
      const filePath = await save({
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      });

      if (filePath) {
        await writeTextFile(filePath, json);
        console.log('JSON file saved successfully');
      }
    } catch (error) {
      console.error('Failed to save JSON file:', error);
    }
  };

  console.log('Final editor content:', editor.children);

  return (
    <DndProvider backend={HTML5Backend}>
      <CommentsProvider users={{}} myUserId="1">
        <div className="editor-container">
          <Plate plugins={plugins} initialValue={initialValue} editor={editor as any} id={editorId}>
            <div className="toolbar-container">
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>
            </div>
            <div className="editor-content">
              <Editor variant={'ghost'} autoFocus size="md"/>
              <FloatingToolbar 
                editorId={editor.id} 
                focusedEditorId={editor.id}
              >
                <FloatingToolbarButtons />
              </FloatingToolbar>
              <CommentsPopover />
            </div>
          </Plate>
          <div className="button-container">
            <Button onClick={handleSaveJson}>Save as JSON</Button>
          </div>
        </div>
      </CommentsProvider>
    </DndProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <ModeToggle />
    <TooltipProvider>
      <div className="App">
        <div style={{
              height: 'auto',
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '5px',
              margin: '10px 0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>

          <PlateEditor />

        </div>
      </div>
    </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;