import React from 'react';
import { Editor } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';

const CustomEditor: React.FC = () => {
  return (
    <div style={{
      height: '500px',  // 或者您想要的任何高度
      overflowY: 'auto',
      border: '1px solid #ccc',
      borderRadius: '8px',  // 添加圆角
      padding: '0px',  // 增加内边距，提供更多留白
      margin: '20px 0',  // 添加上下外边距，与其他元素保持间距
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',  // 添加轻微阴影，增强视觉效果
    }}>
        <FixedToolbar>
            <FixedToolbarButtons />
        </FixedToolbar>
      <Editor variant={'ghost'}/>
    </div>
  );
};

export default CustomEditor;