import { Plus, Sparkle } from 'lucide-react'

const DECORATIONS = [
  { Icon: Plus, top: '10%', left: '4%', size: 14 },
  { Icon: Sparkle, top: '65%', left: '2%', size: 12 },
  { Icon: Plus, top: '75%', left: '92%', size: 12 },
  { Icon: Sparkle, top: '15%', left: '96%', size: 14 },
  { Icon: Plus, top: '40%', left: '50%', size: 10 },
]

export function HeaderSparkles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {DECORATIONS.map(({ Icon, top, left, size }, i) => (
        <Icon key={i} size={size} className="absolute text-violet-300/40" style={{ top, left }} />
      ))}
    </div>
  )
}
