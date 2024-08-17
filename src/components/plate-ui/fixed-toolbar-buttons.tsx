import { useState, useEffect, useMemo } from 'react';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { useEditorReadOnly } from '@udecode/plate-common';
import { MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate-font';
import { ListStyleType } from '@udecode/plate-indent-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';

import { Icons, iconVariants } from '@/components/icons';
import { AlignDropdownMenu } from '@/components/plate-ui/align-dropdown-menu';
import { ColorDropdownMenu } from '@/components/plate-ui/color-dropdown-menu';
import { CommentToolbarButton } from '@/components/plate-ui/comment-toolbar-button';
import { EmojiDropdownMenu } from '@/components/plate-ui/emoji-dropdown-menu';
import { IndentListToolbarButton } from '@/components/plate-ui/indent-list-toolbar-button';
import { IndentToolbarButton } from '@/components/plate-ui/indent-toolbar-button';
import { LineHeightDropdownMenu } from '@/components/plate-ui/line-height-dropdown-menu';
import { LinkToolbarButton } from '@/components/plate-ui/link-toolbar-button';
import { MediaToolbarButton } from '@/components/plate-ui/media-toolbar-button';
import { MoreDropdownMenu } from '@/components/plate-ui/more-dropdown-menu';
import { OutdentToolbarButton } from '@/components/plate-ui/outdent-toolbar-button';
import { TableDropdownMenu } from '@/components/plate-ui/table-dropdown-menu';

import { InsertDropdownMenu } from './insert-dropdown-menu';
import { MarkToolbarButton } from './mark-toolbar-button';
import { ModeDropdownMenu } from './mode-dropdown-menu';
import { ToolbarGroup } from './toolbar';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';

const TOOLBAR_BREAKPOINT_FULL = 1480;
const TOOLBAR_BREAKPOINT_MEDIUM = 1300;
const TOOLBAR_BREAKPOINT_MEDIUM_COMPACT = 1200;
const TOOLBAR_BREAKPOINT_COMPACT = 950;

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCompact = windowWidth < TOOLBAR_BREAKPOINT_COMPACT;
  const isMedium_Compact = windowWidth < TOOLBAR_BREAKPOINT_MEDIUM_COMPACT;
  const isMedium = windowWidth < TOOLBAR_BREAKPOINT_MEDIUM;
  const isFull = windowWidth < TOOLBAR_BREAKPOINT_FULL;

  const moreDropdownItems = useMemo(() => {
    const items = [];

    if (isFull) {
      items.push(
        <OutdentToolbarButton key="outdent">
          <Icons.outdent className={iconVariants({ variant: 'toolbar' })} />
          <span className="ml-2">Outdent</span>
        </OutdentToolbarButton>,
        <IndentToolbarButton key="indent">
          <Icons.indent className={iconVariants({ variant: 'toolbar' })} />
          <span className="ml-2">Indent</span>
        </IndentToolbarButton>,
        <IndentListToolbarButton key="list-disc" nodeType={ListStyleType.Disc}>
          <Icons.ul className={iconVariants({ variant: 'toolbar' })} />
          <span className="ml-2">Bullet List</span>
        </IndentListToolbarButton>,
        <IndentListToolbarButton key="list-decimal" nodeType={ListStyleType.Decimal}>
          <Icons.ol className={iconVariants({ variant: 'toolbar' })} />
          <span className="ml-2">Numbered List</span>
        </IndentListToolbarButton>
      );
    }


    if (isMedium) {
      items.push(
        <ColorDropdownMenu key="text-color" nodeType={MARK_COLOR} tooltip="Text Color">
          <Icons.color className={iconVariants({ variant: 'toolbar' })} />
        </ColorDropdownMenu>,
        <ColorDropdownMenu key="bg-color" nodeType={MARK_BG_COLOR} tooltip="Highlight Color">
          <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
        </ColorDropdownMenu>,
      );
    }

    if (isMedium_Compact) {
      items.push(
        <TableDropdownMenu key="table">
          <Icons.table className={iconVariants({ variant: 'toolbar' })} />
          <span className="ml-2">Table</span>
        </TableDropdownMenu>,
        <EmojiDropdownMenu key="emoji">
          <Icons.emoji className={iconVariants({ variant: 'toolbar' })} />
          <span className="ml-2">Emoji</span>
        </EmojiDropdownMenu>
      );
    }

    if (isCompact) {
      items.push(
        <AlignDropdownMenu key="align">
          <Icons.alignLeft className={iconVariants({ variant: 'toolbar' })} />
          <span className="ml-2">Align</span>
        </AlignDropdownMenu>,
        <LineHeightDropdownMenu key="line-height">
          <Icons.lineHeight className={iconVariants({ variant: 'toolbar' })} />
          <span className="ml-2">Line Height</span>
        </LineHeightDropdownMenu>,
      );
    }

    return items;
  }, [isCompact, isMedium_Compact, isMedium, isFull]);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-wrap" style={{ transform: 'translateX(calc(-1px))' }}>
        {!readOnly && (
          <>
            <ToolbarGroup noSeparator>
              <InsertDropdownMenu />
              <TurnIntoDropdownMenu />
            </ToolbarGroup>

            <ToolbarGroup>
              <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
                <Icons.bold />
              </MarkToolbarButton>
              <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
                <Icons.italic />
              </MarkToolbarButton>
              <MarkToolbarButton
                tooltip="Underline (⌘+U)"
                nodeType={MARK_UNDERLINE}
              >
                <Icons.underline />
              </MarkToolbarButton>
              <MarkToolbarButton
                tooltip="Strikethrough (⌘+⇧+M)"
                nodeType={MARK_STRIKETHROUGH}
              >
                <Icons.strikethrough />
              </MarkToolbarButton>
              <MarkToolbarButton tooltip="Code (⌘+E)" nodeType={MARK_CODE}>
                <Icons.code />
              </MarkToolbarButton>
            </ToolbarGroup>

            {!isCompact && (
              <>
                <ToolbarGroup>
                  <AlignDropdownMenu />
                  <LineHeightDropdownMenu />
                  {!isMedium_Compact && (
                    <>
                      <ToolbarGroup>
                        <TableDropdownMenu />
                        <EmojiDropdownMenu />
                      </ToolbarGroup>
                    </>
                  )}
                  {!isMedium && (
                    <>
                      <ToolbarGroup>
                        <ColorDropdownMenu nodeType={MARK_COLOR} tooltip="Text Color">
                          <Icons.color className={iconVariants({ variant: 'toolbar' })} />
                        </ColorDropdownMenu>
                        <ColorDropdownMenu nodeType={MARK_BG_COLOR} tooltip="Highlight Color">
                          <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
                        </ColorDropdownMenu>
                      </ToolbarGroup>
                    </>
                  )}
                  {!isFull && (
                    <>
                      <IndentListToolbarButton nodeType={ListStyleType.Disc} />
                      <IndentListToolbarButton nodeType={ListStyleType.Decimal} />
                      <OutdentToolbarButton />
                      <IndentToolbarButton />
                    </>
                  )}
                </ToolbarGroup>


              </>
            )}

            <ToolbarGroup>
              <LinkToolbarButton />
              <MediaToolbarButton nodeType={ELEMENT_IMAGE} tooltip="Image"/>
              <MoreDropdownMenu>{moreDropdownItems}</MoreDropdownMenu>
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />

        <ToolbarGroup noSeparator>
          <CommentToolbarButton />
          <ModeDropdownMenu />
        </ToolbarGroup>
      </div>
    </div>
  );
}