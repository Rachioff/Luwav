import { invoke } from '@tauri-apps/api/tauri';
import { convertFileSrc } from '@tauri-apps/api/tauri';

export const handleImageUpload = async (dataUrl: string | ArrayBuffer): Promise<string | ArrayBuffer> => {
  let uint8Array: Uint8Array;

  if (typeof dataUrl === 'string') {
    // 如果是 base64 字符串
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    uint8Array = new Uint8Array(arrayBuffer);
  } else {
    // 如果是 ArrayBuffer
    uint8Array = new Uint8Array(dataUrl);
  }

  const savedPath = await invoke('save_image', { 
    fileData: Array.from(uint8Array),
    fileName: `image_${Date.now()}.png` // 生成一个唯一的文件名
  }) as string;
  
  return convertFileSrc(savedPath);
};