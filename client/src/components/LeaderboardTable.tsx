interface LeaderboardEntry {
  rank: number
  traineeId: string
  name: string
  currentStreakWeeks: number
  totalWorkoutDays: number
  badgeCount: number
}

export function LeaderboardTable({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId?: string }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No leaderboard data yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-3 font-medium">#</th>
            <th className="py-2 pr-3 font-medium">Name</th>
            <th className="py-2 pr-3 font-medium text-right">Streak</th>
            <th className="py-2 pr-3 font-medium text-right">Workouts</th>
            <th className="py-2 font-medium text-right">Badges</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.traineeId}
              className={`border-b last:border-0 ${e.traineeId === currentUserId ? 'bg-primary/5 font-medium' : ''}`}
            >
              <td className="py-2 pr-3">
                {e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : e.rank}
              </td>
              <td className="py-2 pr-3">{e.name}</td>
              <td className="py-2 pr-3 text-right">
                {e.currentStreakWeeks > 0 ? `🔥 ${e.currentStreakWeeks}w` : '-'}
              </td>
              <td className="py-2 pr-3 text-right">{e.totalWorkoutDays}</td>
              <td className="py-2 text-right">{e.badgeCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
