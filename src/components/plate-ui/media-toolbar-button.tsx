// import React from 'react';
import { withRef } from '@udecode/cn';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  useMediaToolbarButton,
} from '@udecode/plate-media';
import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';

import { Icons } from '@/components/icons';
import { ToolbarButton } from './toolbar';

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
    onImageInsert?: (imageData: string) => void;
  }
>(({ nodeType, onImageInsert, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });

  const handleClick = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Image',
          extensions: ['png', 'jpg', 'jpeg', 'gif']
        }]
      });

      if (selected && !Array.isArray(selected)) {
        const contents = await readBinaryFile(selected);
        const base64 = btoa(
          new Uint8Array(contents).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const imageData = `data:image/png;base64,${base64}`;
        
        if (onImageInsert) {
          onImageInsert(imageData);
        }
      }
    } catch (error) {
      console.error('Error selecting or reading file:', error);
    }
  };

  return (
    <ToolbarButton
      ref={ref}
      {...rest}
      onClick={handleClick}
      onMouseDown={props.onMouseDown}
    >
      <Icons.image />
    </ToolbarButton>
  );
});