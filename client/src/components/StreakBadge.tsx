export function StreakBadge({ weeks }: { weeks: number }) {
  if (weeks === 0) return null
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
      🔥 {weeks}w
    </span>
  )
}
