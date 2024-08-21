import React, { useState, useEffect, useRef } from 'react';
import { Type } from 'lucide-react';

interface FontToggleProps {
  currentFont: string;
  setCurrentFont: (font: string) => void;
  fonts: { name: string; label: string; value: string }[];
}

export const FontToggle: React.FC<FontToggleProps> = ({ currentFont, setCurrentFont, fonts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [animatingFont, setAnimatingFont] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleFontChange = (font: string) => {
    if (labelRef.current) {
      labelRef.current.classList.add('swap-out');
      setTimeout(() => {
        setAnimatingFont(font);
        setCurrentFont(font);
        labelRef.current?.classList.remove('swap-out');
        labelRef.current?.classList.add('swap-in');
        setTimeout(() => {
          labelRef.current?.classList.remove('swap-in');
        }, 300);
      }, 300);
    }
  };

  const getFontClass = (fontName: string) => {
    switch (fontName.toLowerCase()) {
      case 'kai': return 'font-kai';
      case 'imitationsong': return 'font-imitationsong';
      case 'song': return 'font-song';
      default: return 'font-default';
    }
  };

  const currentFontData = fonts.find(f => f.name === (animatingFont || currentFont));

  return (
    <div 
      className="font-toggle" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="font-toggle-button" onClick={toggleDropdown}>
        <Type size={20} />
      </button>
      <span 
        className={`font-toggle-label ${getFontClass(currentFontData?.name || '')}`} 
        onClick={toggleDropdown} 
        ref={labelRef}
      >
        {currentFontData?.label || 'Font'}
      </span>
      {(isOpen || isHovering) && (
        <div className={`font-toggle-dropdown ${isOpen ? 'show' : ''}`}>
          {fonts.map((font) => (
            font.name !== currentFont && (
              <button
                key={font.name}
                onClick={() => handleFontChange(font.name)}
                className={getFontClass(font.name)}
              >
                {font.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};