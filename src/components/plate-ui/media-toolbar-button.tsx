// import React from 'react';
import { withRef } from '@udecode/cn';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  useMediaToolbarButton,
} from '@udecode/plate-media';

import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });

  return (
    <ToolbarButton
      ref={ref}
      {...rest}
      onClick={async (_e) => {
        console.log('Media button clicked');
        try {
          console.log('Before calling props.onClick');
          props.onClick();
          console.log('After calling props.onClick');
        } catch (error) {
          console.error('Error inserting media:', error);
        }
      }}
      onMouseDown={props.onMouseDown}
    >
      <Icons.image />
      <Icons.moon />
    </ToolbarButton>
  );
});
