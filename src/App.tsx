import { TooltipProvider } from '@radix-ui/react-tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import { FontToggle } from '@/components/font-toggle';
import { PlateEditor } from '@/components/plate-editor';
import { FontProvider } from '@/lib/font-context';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <FontProvider>
        <TooltipProvider>
          <div className="App">
            <PlateEditor />
          </div>
        </TooltipProvider>
        <div className="mode-toggle-container">
          <ModeToggle />
          <FontToggle />
        </div>
      </FontProvider>
    </ThemeProvider>
  );
}

export default App;