import { PlateElement, PlateElementProps, TElement } from '@udecode/plate-common';
import { ELEMENT_IMAGE, useMediaState } from '@udecode/plate-media';
import { useResizableStore } from '@udecode/plate-resizable';
import { cn } from '@udecode/cn';

import { Caption, CaptionTextarea } from './caption';
import { MediaPopover } from './media-popover';
import {
  Resizable,
  ResizeHandle,
  mediaResizeHandleVariants,
} from './resizable';

export interface ImageElementProps extends PlateElementProps {
  element: TElement & {
    url?: string;
  };
}

export const ImageElement = (props: ImageElementProps) => {
  const { children, className, element, ...elementProps } = props;
  const { align = 'center', focused, readOnly, selected } = useMediaState();
  const width = useResizableStore().get.width();

  return (
    <MediaPopover pluginKey={ELEMENT_IMAGE}>
      <PlateElement element={element} className={cn('py-2.5', className)} {...elementProps}>
        <figure className="group relative m-0" contentEditable={false}>
          <Resizable
            align={align}
            options={{
              align,
              readOnly,
            }}
          >
            <ResizeHandle
              options={{ direction: 'left' }}
              className={mediaResizeHandleVariants({ direction: 'left' })}
            />
            <img
              src={element.url}
              alt=""
              className={cn(
                'block w-full max-w-full cursor-pointer object-cover px-0',
                'rounded-sm',
                focused && selected && 'ring-2 ring-ring ring-offset-2'
              )}
            />
            <ResizeHandle
              options={{ direction: 'right' }}
              className={mediaResizeHandleVariants({ direction: 'right' })}
            />
          </Resizable>

          <Caption align={align} style={{ width }}>
            <CaptionTextarea
              placeholder="Write a caption..."
              readOnly={readOnly}
            />
          </Caption>
        </figure>

        {children}
      </PlateElement>
    </MediaPopover>
  );
};