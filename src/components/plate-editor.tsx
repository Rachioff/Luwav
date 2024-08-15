'use client';

import { useState, useMemo } from 'react';

import '../App.css';

import { Plate, createPlateEditor } from '@udecode/plate-common';
import { CommentsProvider } from '@udecode/plate-comments';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { Button } from '@/components/plate-ui/button';
import { Editor } from '@/components/plate-ui/editor';

import { writeTextFile } from '@tauri-apps/api/fs';
import { save } from '@tauri-apps/api/dialog';
import { join } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri';

import { plugins } from '@/lib/plate/plate-plugins';

import initV from "@/assets/initialValue.json";

import { useFont } from '@/lib/font-context';
import { nanoid } from 'nanoid';

export function PlateEditor() {
  const { font } = useFont();
  
  const [editor] = useState(() => createPlateEditor({ plugins, id: 'main-editor' }));
  const editorId = useMemo(() => nanoid(), []);

  const initialValue = JSON.parse(JSON.stringify(initV));

  const handleSaveJson = async () => {
    try {
      const json = JSON.stringify(editor.children, null, 2);
      const filePath = await save({
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (filePath) {
        await writeTextFile(filePath, json);
        console.log('JSON file saved successfully');
      }
    } catch (error) {
      console.error('Failed to save JSON file:', error);
    }
  };

  const handleSave = async () => {
    try {
      const json = JSON.stringify(editor.children, null, 2);
      
      // 获取notes目录路径
      const notesDir = await invoke('get_notes_dir') as string;
      
      // 生成文件名，使用当前日期和时间
      const date = new Date();
      const fileName = `note_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.json`;
      console.log('File name:', fileName);
      // 组合完整的文件路径
      const filePath = await join(notesDir, fileName);
      console.log('File path:', filePath);
      // 写入文件
      await writeTextFile(filePath, json);
      console.log('File saved successfully to:', filePath);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <CommentsProvider users={{}} myUserId="1">
        <div className="plate-container" data-font={font}>
            <div className="info-sidebar">
              <Button disabled className="save-button" onClick={handleSave}>Save</Button>
              <Button className="save-button1" onClick={handleSaveJson}>Save as JSON</Button>
              <div className="info-content">
                <div className="breadcrumb">Root &gt; Folder</div>
                <h2 className="document-title">Document Title</h2>
                <div className="document-meta">
                  <p>Created: {new Date().toLocaleDateString()}</p>
                  <p>Modified: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="editor-container">
              <Plate plugins={plugins} initialValue={initialValue} editor={editor} id={editorId}>
                <div className="toolbar-container">
                  <FixedToolbar>
                    <FixedToolbarButtons />
                  </FixedToolbar>
                </div>
                <div className="editor-content">
                  <Editor variant={'ghost'} autoFocus size="md"/>
                  <FloatingToolbar editorId={editor.id} focusedEditorId={editor.id}>
                    <FloatingToolbarButtons />
                  </FloatingToolbar>
                  <CommentsPopover />
                </div>
              </Plate>
            </div>

        </div>
      </CommentsProvider>
    </DndProvider>
  );
}