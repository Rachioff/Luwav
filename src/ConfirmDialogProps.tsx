import React, { useEffect } from 'react';
import './ConfirmDialogPatern.css'; // 引入CSS文件以控制样式
import ReactDOM from 'react-dom';

interface ModalProps {
  onClose: (result: boolean) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-message">是否要删除这个文件?</div>
                <div className="modal-buttons">
                <button onClick={() => onClose(true)} className="modal-close-button-confirm">删除</button>
                <button onClick={() => onClose(false)} className="modal-close-button-cancel">取消</button>
            </div>
        </div>
    </div>
  );
};

export const showModal = (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      // 创建一个新的DOM节点
      const modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
  
      ReactDOM.render(
        <Modal onClose={(result) => {
          // 添加淡出动画
          const overlay = document.querySelector('.modal-overlay') as HTMLElement;
          if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s forwards';
          }
  
          // 等待动画完成后卸载组件和移除DOM节点
          setTimeout(() => {
            ReactDOM.unmountComponentAtNode(modalRoot);
            document.body.removeChild(modalRoot);
            resolve(result); // 解析Promise，返回用户的选择
          }, 200); // 与动画时长匹配
        }} />,
        modalRoot
      );
    });
  };
