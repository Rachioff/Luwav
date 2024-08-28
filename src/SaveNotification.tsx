import React, { useEffect, useState } from 'react';

interface SaveNotificationProps {
  isVisible: boolean;
  onHide: () => void;
}

const SaveNotification: React.FC<SaveNotificationProps> = ({ isVisible, onHide }) => {
  const [opacity, setOpacity] = useState(0);
  const [display, setDisplay] = useState('none');

  useEffect(() => {
    let fadeOutTimeoutId: NodeJS.Timeout;
    let hideTimeoutId: NodeJS.Timeout;

    if (isVisible) {
      setDisplay('block');
      // 使用 setTimeout 来确保在设置 display 后再设置 opacity，以触发淡入效果
      setTimeout(() => setOpacity(1), 10);

      fadeOutTimeoutId = setTimeout(() => {
        setOpacity(0);
        hideTimeoutId = setTimeout(() => {
          setDisplay('none');
          onHide();
        }, 300); // 等待淡出动画完成后隐藏
      }, 2000); // 显示 2 秒后开始淡出
    } else {
      setOpacity(0);
      hideTimeoutId = setTimeout(() => {
        setDisplay('none');
      }, 300);
    }

    return () => {
      if (fadeOutTimeoutId) clearTimeout(fadeOutTimeoutId);
      if (hideTimeoutId) clearTimeout(hideTimeoutId);
    };
  }, [isVisible, onHide]);

  return (
    <div
      className='save-notification'
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '5px',
        transition: 'opacity 0.3s ease-in-out',
        opacity: opacity,
        display: display,
      }}
    >
      已保存
    </div>
  );
};

export default SaveNotification;