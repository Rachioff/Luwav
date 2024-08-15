import { createContext, useContext, useState, ReactNode } from 'react';

export type FontType = 'Default' | 'Kai' | 'ImitationSong' | 'Song';

type FontContextType = {
  font: FontType;
  setFont: (font: FontType) => void;
};

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState<FontType>('Default');

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}