import { TypeOutlineIcon as Font } from "lucide-react"

import { Button } from "@/components/plate-ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/plate-ui/dropdown-menu"
import { useFont } from "@/lib/font-context"

const fonts = [
  { name: 'Default', label: '默认字体' },
  { name: 'Kai', label: '楷体' },
  { name: 'ImitationSong', label: '仿宋体' },
  { name: 'Song', label: '宋体' },
];

export function FontToggle() {
  const { setFont } = useFont()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Font className="h-[1.2rem] w-[1.2rem] ghost " />
          <span className="sr-only">Toggle font</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {fonts.map((f) => (
          <DropdownMenuItem 
            key={f.name} 
            onClick={() => setFont(f.name as any)}
            style={{ fontFamily: `var(--font-${f.name.toLowerCase()})` }}
          >
            {f.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}