import { Button } from '@/components/plate-ui/button';
import { useFont, FontType } from '@/lib/font-context';

const fonts: { name: FontType; label: string }[] = [
  { name: 'Default', label: '黑体' },
  { name: 'Kai', label: '楷体' },
  { name: 'ImitationSong', label: '仿宋' },
  { name: 'Song', label: '宋体' },
];

export function FontSwitcher() {
  const { font, setFont } = useFont();

  return (
    <div className="font-switcher">
      {fonts.map((f) => (
        <Button
          key={f.name}
          onClick={() => setFont(f.name)}
          variant={font === f.name ? 'default' : 'outline'}
          className="mx-1"
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}