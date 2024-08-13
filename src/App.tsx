// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useState, useEffect } from 'react';
import './App.css'
'use client';

import { withProps } from '@udecode/cn';
import { createPlugins, Plate, RenderAfterEditable, PlateLeaf, PlateElement, createDeserializeHtmlPlugin } from '@udecode/plate-common';
import { createParagraphPlugin, ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { createHeadingPlugin, ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4, ELEMENT_H5, ELEMENT_H6 } from '@udecode/plate-heading';
import { createBlockquotePlugin, ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin, ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE, ELEMENT_CODE_SYNTAX } from '@udecode/plate-code-block';
import { createHorizontalRulePlugin, ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { createLinkPlugin, ELEMENT_LINK } from '@udecode/plate-link';
import { createImagePlugin, ELEMENT_IMAGE, createMediaEmbedPlugin, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';
import { createExcalidrawPlugin, ELEMENT_EXCALIDRAW } from '@udecode/plate-excalidraw';
import { createTogglePlugin, ELEMENT_TOGGLE } from '@udecode/plate-toggle';
import { createColumnPlugin, ELEMENT_COLUMN_GROUP, ELEMENT_COLUMN } from '@udecode/plate-layout';
import { createCaptionPlugin } from '@udecode/plate-caption';
import { createTablePlugin, ELEMENT_TABLE, ELEMENT_TR, ELEMENT_TD, ELEMENT_TH } from '@udecode/plate-table';
import { createTodoListPlugin, ELEMENT_TODO_LI } from '@udecode/plate-list';
import { createBoldPlugin, MARK_BOLD, createItalicPlugin, MARK_ITALIC, createUnderlinePlugin, MARK_UNDERLINE, createStrikethroughPlugin, MARK_STRIKETHROUGH, createCodePlugin, MARK_CODE, createSubscriptPlugin, MARK_SUBSCRIPT, createSuperscriptPlugin, MARK_SUPERSCRIPT } from '@udecode/plate-basic-marks';
import { createFontColorPlugin, createFontBackgroundColorPlugin, createFontSizePlugin } from '@udecode/plate-font';
import { createHighlightPlugin, MARK_HIGHLIGHT } from '@udecode/plate-highlight';
import { createKbdPlugin, MARK_KBD } from '@udecode/plate-kbd';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createIndentListPlugin } from '@udecode/plate-indent-list';
import { createLineHeightPlugin } from '@udecode/plate-line-height';
import { createAutoformatPlugin } from '@udecode/plate-autoformat';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createEmojiPlugin } from '@udecode/plate-emoji';
import { createExitBreakPlugin, createSoftBreakPlugin } from '@udecode/plate-break';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createDeletePlugin } from '@udecode/plate-select';
import { createTabbablePlugin } from '@udecode/plate-tabbable';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { createCommentsPlugin, CommentsProvider, MARK_COMMENT } from '@udecode/plate-comments';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { createDeserializeCsvPlugin } from '@udecode/plate-serializer-csv';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createJuicePlugin } from '@udecode/plate-juice';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { BlockquoteElement } from '@/components/plate-ui/blockquote-element';
import { CodeBlockElement } from '@/components/plate-ui/code-block-element';
import { CodeLineElement } from '@/components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '@/components/plate-ui/code-syntax-leaf';
import { ExcalidrawElement } from '@/components/plate-ui/excalidraw-element';
import { HrElement } from '@/components/plate-ui/hr-element';
import { ImageElement } from '@/components/plate-ui/image-element';
import { LinkElement } from '@/components/plate-ui/link-element';
import { LinkFloatingToolbar } from '@/components/plate-ui/link-floating-toolbar';
import { ListElement } from '@/components/plate-ui/list-element';
import { ToggleElement } from '@/components/plate-ui/toggle-element';
import { ColumnGroupElement } from '@/components/plate-ui/column-group-element';
import { ColumnElement } from '@/components/plate-ui/column-element';
import { HeadingElement } from '@/components/plate-ui/heading-element';
import { MediaEmbedElement } from '@/components/plate-ui/media-embed-element';
import { ParagraphElement } from '@/components/plate-ui/paragraph-element';
import { TableElement } from '@/components/plate-ui/table-element';
import { TableRowElement } from '@/components/plate-ui/table-row-element';
import { TableCellElement, TableCellHeaderElement } from '@/components/plate-ui/table-cell-element';
import { TodoListElement } from '@/components/plate-ui/todo-list-element';
import { CodeLeaf } from '@/components/plate-ui/code-leaf';
import { CommentLeaf } from '@/components/plate-ui/comment-leaf';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { HighlightLeaf } from '@/components/plate-ui/highlight-leaf';
import { KbdLeaf } from '@/components/plate-ui/kbd-leaf';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { withPlaceholders } from '@/components/plate-ui/placeholder';
import { withDraggables } from '@/components/plate-ui/with-draggables';
import { EmojiInputElement } from '@/components/plate-ui/emoji-input-element';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Button } from '@/components/plate-ui/button';
import { Editor } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';


import { autoformatRules } from '@/components/autoformatRules';

import { createPlateEditor } from '@udecode/plate-common';
import { serializeHtml } from '@udecode/plate-serializer-html';

import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';

const plugins = createPlugins(
  [
    createParagraphPlugin(),
    createHeadingPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHorizontalRulePlugin(),
    createLinkPlugin({
      renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
    }),
    createImagePlugin(),
    createExcalidrawPlugin(),
    createTogglePlugin(),
    createColumnPlugin(),
    createMediaEmbedPlugin(),
    createCaptionPlugin({
      options: {
        pluginKeys: [
          ELEMENT_IMAGE,
          ELEMENT_MEDIA_EMBED
          // ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED
        ]
      },
    }),
    createTablePlugin(),
    createTodoListPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createFontColorPlugin(),
    createFontBackgroundColorPlugin(),
    createFontSizePlugin(),
    createHighlightPlugin(),
    createKbdPlugin(),
    createAlignPlugin({
      inject: {
        props: {
          validTypes: [
            ELEMENT_PARAGRAPH,
            ELEMENT_H1,
            ELEMENT_H2,
            ELEMENT_H3,
            ELEMENT_H4,
            ELEMENT_H5,
            ELEMENT_H6,
          ],
        },
      },
    }),

    createIndentPlugin({
      inject: {
        props: {
          validTypes: [
            ELEMENT_PARAGRAPH,
            // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_BLOCKQUOTE, ELEMENT_CODE_BLOCK
          ],
        },
      },
    }),
    createIndentListPlugin({
      inject: {
        props: {
          validTypes: [
            ELEMENT_PARAGRAPH,
            ELEMENT_H1,
            ELEMENT_H2,
            ELEMENT_H3,
            ELEMENT_H4,
            ELEMENT_H5,
            ELEMENT_H6,
            ELEMENT_BLOCKQUOTE,
            ELEMENT_CODE_BLOCK,
            ELEMENT_TOGGLE,
          ],
        },
      },
    }),
    createLineHeightPlugin({
      inject: {
        props: {
          defaultNodeValue: 1.5,
          validNodeValues: [1, 1.2, 1.5, 2, 3],
          validTypes: [
            ELEMENT_PARAGRAPH,
            ELEMENT_H1,
            ELEMENT_H2,
            ELEMENT_H3,
            ELEMENT_H4,
            ELEMENT_H5,
            ELEMENT_H6,
            // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3
          ],
        },
      },
    }),
    createAutoformatPlugin({
      options: {
        rules: autoformatRules,
        // rules: [
        //   autoformatRules
        //   // Usage: https://platejs.org/docs/autoformat
        // ],
        enableUndoOnDelete: true,
      },
    }),
    createBlockSelectionPlugin({
      options: {
        sizes: {
          top: 0,
          bottom: 0,
        },
      },
    }),
    createDndPlugin({
        options: { enableScroller: true },
    }),
    createEmojiPlugin(),
    createExitBreakPlugin({
      options: {
        rules: [
          {
            hotkey: 'mod+enter',
          },
          {
            hotkey: 'mod+shift+enter',
            before: true,
          },
          {
            hotkey: 'enter',
            query: {
              start: true,
              end: true,
              // allow: KEYS_HEADING,
            },
            relative: true,
            level: 1,
          },
        ],
      },
    }),
    createNodeIdPlugin(),
    createResetNodePlugin({
      options: {
        rules: [
          // Usage: https://platejs.org/docs/reset-node
        ],
      },
    }),
    createDeletePlugin(),
    createSoftBreakPlugin({
      options: {
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [
                // ELEMENT_CODE_BLOCK,
                // ELEMENT_BLOCKQUOTE,
                // ELEMENT_TD,
                // ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD
              ],
            },
          },
        ],
      },
    }),
    createTabbablePlugin(),
    createTrailingBlockPlugin({
      options: { type: ELEMENT_PARAGRAPH },
    }),
    createCommentsPlugin(),
    createDeserializeDocxPlugin(),
    createDeserializeCsvPlugin(),
    createDeserializeMdPlugin(),
    createDeserializeHtmlPlugin(),
    createJuicePlugin(),
  ],
  {
    components: withDraggables(withPlaceholders({
      [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
      [ELEMENT_CODE_BLOCK]: CodeBlockElement,
      [ELEMENT_CODE_LINE]: CodeLineElement,
      [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
      [ELEMENT_EXCALIDRAW]: ExcalidrawElement,
      [ELEMENT_HR]: HrElement,
      [ELEMENT_IMAGE]: ImageElement,
      [ELEMENT_LINK]: LinkElement,
      [ELEMENT_TOGGLE]: ToggleElement,
      [ELEMENT_COLUMN_GROUP]: ColumnGroupElement,
      [ELEMENT_COLUMN]: ColumnElement,
      [ELEMENT_H1]: withProps(HeadingElement, { variant: 'h1' }),
      [ELEMENT_H2]: withProps(HeadingElement, { variant: 'h2' }),
      [ELEMENT_H3]: withProps(HeadingElement, { variant: 'h3' }),
      [ELEMENT_H4]: withProps(HeadingElement, { variant: 'h4' }),
      [ELEMENT_H5]: withProps(HeadingElement, { variant: 'h5' }),
      [ELEMENT_H6]: withProps(HeadingElement, { variant: 'h6' }),
      [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
      [ELEMENT_PARAGRAPH]: ParagraphElement,
      [ELEMENT_TABLE]: TableElement,
      [ELEMENT_TR]: TableRowElement,
      [ELEMENT_TD]: TableCellElement,
      [ELEMENT_TH]: TableCellHeaderElement,
      [ELEMENT_TODO_LI]: TodoListElement,
      [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
      [MARK_CODE]: CodeLeaf,
      [MARK_COMMENT]: CommentLeaf,
      [MARK_HIGHLIGHT]: HighlightLeaf,
      [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
      [MARK_KBD]: KbdLeaf,
      [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: 's' }),
      [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: 'sub' }),
      [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: 'sup' }),
      [MARK_UNDERLINE]: withProps(PlateLeaf, { as: 'u' }),
    })),
  }
);


import initV from "@/assets/initialValue.json"
const initialValue = JSON.parse(JSON.stringify(initV));


import { nanoid } from 'nanoid';
import { useMemo } from 'react';

export function PlateEditor() {
  const [editor] = useState(() => createPlateEditor({ plugins }));
  const editorId = useMemo(() => nanoid(), []); // 使用 nanoid 或其他方法生成唯一ID

  console.log('Initial editor content:', editor.children);

  const html = serializeHtml(editor, {
    nodes: editor.children,
    dndWrapper: (props) => <DndProvider backend={HTML5Backend} {...props} />, // 确保传递了这个参数
  });

  const handleSaveHtml = async () => {
    console.log('Save HTML button clicked');
    console.log("Editor content:", editor.children);

    try {
      console.log('Current serialized HTML:', html);
      const filePath = await save({
        filters: [{ name: 'HTML', extensions: ['html'] }]
      });
      console.log('File path selected:', filePath);
  
      if (filePath) {
        await writeTextFile(filePath, html);
        console.log('HTML file saved successfully');
      }
    } catch (error) {
      console.error('Failed to save HTML file:', error);
    }
  };

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
                editorId={editorId}
                focusedEditorId={editorId} // 假设这个编辑器总是焦点
              >
                <FloatingToolbarButtons />
              </FloatingToolbar>
              <CommentsPopover />
            </div>
          </Plate>
          <div className="button-container">
            <Button onClick={handleSaveHtml}>Save as HTML</Button>
            <Button onClick={handleSaveJson}>Save as JSON</Button>
          </div>
        </div>
      </CommentsProvider>
    </DndProvider>
  );
}

function App() {
  return (
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
  );
}

export default App;