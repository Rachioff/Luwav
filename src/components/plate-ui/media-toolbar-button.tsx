import React, { useRef, useState } from 'react';
import { withRef } from '@udecode/cn';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  useMediaToolbarButton,
  insertMedia,
} from '@udecode/plate-media';
import { useEditorRef } from '@udecode/plate-common';

import { Icons } from '@/components/icons';
import { ToolbarButton } from './toolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/plate-ui/dialog';
import { Input } from '@/components/plate-ui/input';
import { Button } from '@/components/plate-ui/button';

import { invoke } from '@tauri-apps/api/tauri';
import { convertFileSrc } from '@tauri-apps/api/tauri';

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const editor = useEditorRef();

  // const handleUrlInsert = () => {
  //   if (url) {
  //     insertMedia(editor, { 
  //       getUrl: () => Promise.resolve(url),
  //       type: ELEMENT_IMAGE 
  //     });
  //     setOpen(false);
  //     setUrl('');
  //   }
  // };
  
  // const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     // 在实际应用中，这里应该上传文件到服务器并获取URL
  //     const localUrl = URL.createObjectURL(file);
  //     insertMedia(editor, { 
  //       getUrl: () => Promise.resolve(localUrl),
  //       type: ELEMENT_IMAGE 
  //     });
  //     setOpen(false);
  //   }
  // };

  const handleUrlInsert = async () => {
    if (url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", { type: blob.type });
        const assetUrl = await saveImage(file);
        insertMedia(editor, { 
          getUrl: () => Promise.resolve(assetUrl),
          type: ELEMENT_IMAGE 
        });
        setOpen(false);
        setUrl('');
      } catch (error) {
        console.error("Failed to save image from URL:", error);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const assetUrl = await saveImage(file);
      insertMedia(editor, { 
        getUrl: () => Promise.resolve(assetUrl),
        type: ELEMENT_IMAGE 
      });
      setOpen(false);
    }
  };

  const saveImage = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const savedPath = await invoke('save_image', { 
      fileData: Array.from(uint8Array),
      fileName: file.name
    }) as string;
    return convertFileSrc(savedPath);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <ToolbarButton
            ref={ref}
            {...rest}
            onClick={() => setOpen(true)}
            onMouseDown={props.onMouseDown}
          >
            <Icons.image />
          </ToolbarButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter image URL"
                className="col-span-3"
              />
              <Button onClick={handleUrlInsert}>Insert</Button>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="col-span-3"
              />
              <Button onClick={() => fileInputRef.current?.click()}>Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});