import React, { ReactNode, useState, useEffect } from 'react';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { MARK_SUBSCRIPT, MARK_SUPERSCRIPT } from '@udecode/plate-basic-marks';
import { focusEditor, toggleMark, useEditorRef } from '@udecode/plate-common';
import { Icons} from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

interface MoreDropdownMenuProps extends DropdownMenuProps {
  children?: ReactNode;
}

interface DropdownItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  showLabel: boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ icon, label, onClick, showLabel }) => (
  <DropdownMenuItem
    onSelect={onClick}
    className="flex items-center justify-start p-2"
  >
    {icon}
    {showLabel && <span className="ml-2">{label}</span>}
  </DropdownMenuItem>
);

export function MoreDropdownMenu({ children, ...props }: MoreDropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();
  const [columns, setColumns] = useState(2);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const itemCount = React.Children.count(children) + 2; // +2 for Superscript and Subscript

      if (width < 640 || itemCount <= 4) {
        setColumns(2);
      } else if (width < 960 || itemCount <= 9) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [children]);

  useEffect(() => {
    setShowLabels(React.Children.count(children) === 0);
  }, [children]);

  // const childrenCount = React.Children.count(children);
  // const totalItems = childrenCount + 2; // +2 for Superscript and Subscript

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="More options">
          <Icons.more />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="max-h-[300px] overflow-y-auto p-2"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: '0.5rem',
          width: `${columns * (showLabels ? 140 : 60)}px`,
          maxWidth: '90vw',
        }}
      >
        {React.Children.map(children, (child) => (
          <div className="flex items-center justify-start">
            {child}
          </div>
        ))}
        <DropdownItem
          icon={<Icons.superscript className="h-5 w-5" />}
          label="Superscript"
          onClick={() => {
            toggleMark(editor, {
              clear: [MARK_SUBSCRIPT, MARK_SUPERSCRIPT],
              key: MARK_SUPERSCRIPT,
            });
            focusEditor(editor);
          }}
          showLabel={showLabels}
        />
        <DropdownItem
          icon={<Icons.subscript className="h-5 w-5" />}
          label="Subscript"
          onClick={() => {
            toggleMark(editor, {
              clear: [MARK_SUPERSCRIPT, MARK_SUBSCRIPT],
              key: MARK_SUBSCRIPT,
            });
            focusEditor(editor);
          }}
          showLabel={showLabels}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}