import React, { useState } from 'react';

interface FileUploadModalProps {
  type: string;
  onInsert: (file: File) => void;
  onClose: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ type, onInsert, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleInsert = () => {
    if (file) {
      onInsert(file);
    } else if (url) {
      // 处理URL插入
      // 这里需要实现从URL下载文件并上传的逻辑
    }
    onClose();
  };

  return (
    <div className="file-upload-modal">
      <h2>Insert {type}</h2>
      <input type="file" accept={`${type}/*`} onChange={handleFileChange} />
      <input type="text" placeholder="Or enter URL" value={url} onChange={handleUrlChange} />
      <button onClick={handleInsert} disabled={!file && !url}>Insert</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};