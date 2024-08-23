import React, { useState, ChangeEvent } from 'react';

interface ImageInsertModalProps {
  onInsert: (source: string) => void;
  onClose: () => void;
}

const ImageInsertModal: React.FC<ImageInsertModalProps> = ({ onInsert, onClose }) => {
  const [insertType, setInsertType] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const handleInsert = () => {
    if (insertType === 'url') {
      onInsert(url);
    } else if (file) {
      // 这里我们暂时直接使用文件对象，后续我们会修改这部分逻辑来处理文件备份
      onInsert(URL.createObjectURL(file));
    }
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="image-insert-modal">
      <div>
        <button onClick={() => setInsertType('url')}>URL</button>
        <button onClick={() => setInsertType('file')}>文件</button>
      </div>
      {insertType === 'url' ? (
        <input
          type="text"
          value={url}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
          placeholder="输入图片URL"
        />
      ) : (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      )}
      <button onClick={handleInsert}>插入</button>
      <button onClick={onClose}>取消</button>
    </div>
  );
};

export default ImageInsertModal;