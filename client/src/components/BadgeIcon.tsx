interface BadgeIconProps {
  icon: string
  name: string
  description?: string
  earned: boolean
}

export function BadgeIcon({ icon, name, description, earned }: BadgeIconProps) {
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-center transition-colors ${
      earned ? 'bg-background border-primary/20' : 'bg-muted/50 border-transparent opacity-40 grayscale'
    }`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium leading-tight">{name}</span>
      {description && <span className="text-[10px] text-muted-foreground leading-tight">{description}</span>}
    </div>
  )
}
