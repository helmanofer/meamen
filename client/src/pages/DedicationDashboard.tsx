import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BadgeIcon } from '@/components/BadgeIcon'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { WorkoutHeatmap } from '@/components/WorkoutHeatmap'
import { ChallengeCard } from '@/components/ChallengeCard'

interface Stats {
  currentStreakWeeks: number
  longestStreakWeeks: number
  perfectWeeks: number
  totalWorkoutDays: number
  minWeeklyFrequency: number
  activityDays: Record<string, number>
  badges: Array<{ key: string; earnedAt: string; name?: string; icon?: string }>
}

interface BadgeDef {
  key: string
  name: string
  description: string
  category: string
  icon: string
}

interface RewardItem {
  id: string
  condition: string
  description: string
  met: boolean
}

interface LeaderboardEntry {
  rank: number
  traineeId: string
  name: string
  currentStreakWeeks: number
  totalWorkoutDays: number
  badgeCount: number
}

interface ChallengeItem {
  id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
}

export default function DedicationDashboard() {
  const { user, logout } = useAuth()
  const { traineeId } = useParams<{ traineeId: string }>()
  const isTrainer = user?.role === 'TRAINER'
  const targetTraineeId = isTrainer ? traineeId : undefined

  const [stats, setStats] = useState<Stats | null>(null)
  const [allBadges, setAllBadges] = useState<BadgeDef[]>([])
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [config, setConfig] = useState<{ leaderboardEnabled: boolean }>({ leaderboardEnabled: false })
  const [leaderboardOptOut, setLeaderboardOptOut] = useState(false)

  // Challenges
  const [challengeData, setChallengeData] = useState<{ active: ChallengeItem[]; upcoming: ChallengeItem[]; past: ChallengeItem[] }>({ active: [], upcoming: [], past: [] })
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeDescription, setChallengeDescription] = useState('')
  const [challengeType, setChallengeType] = useState('most_workouts')
  const [challengeStartDate, setChallengeStartDate] = useState('')
  const [challengeEndDate, setChallengeEndDate] = useState('')

  // Reward creation form
  const [showRewardForm, setShowRewardForm] = useState(false)
  const [rewardCondition, setRewardCondition] = useState('')
  const [rewardDescription, setRewardDescription] = useState('')

  // Min weekly frequency form
  const [editingFrequency, setEditingFrequency] = useState(false)
  const [newFrequency, setNewFrequency] = useState('')

  const loadData = useCallback(async () => {
    const [s, b, c] = await Promise.all([
      api.getDedicationStats(targetTraineeId),
      api.getBadgeDefinitions(),
      api.getDedicationConfig(),
    ])
    setStats(s)
    setAllBadges(b)
    setConfig(c)

    const r = await api.getRewards(targetTraineeId)
    setRewards(r)

    if (c.leaderboardEnabled) {
      try {
        const lb = await api.getLeaderboard()
        setLeaderboard(lb)
      } catch { /* leaderboard may fail if disabled */ }
    }

    try {
      const ch = await api.getChallenges()
      setChallengeData(ch)
    } catch { /* challenges may not be available */ }
  }, [targetTraineeId])

  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (mounted) await loadData()
    }
    init()
    return () => { mounted = false }
  }, [targetTraineeId, loadData])

  const handleCreateReward = async (e: FormEvent) => {
    e.preventDefault()
    await api.createReward({ condition: rewardCondition, description: rewardDescription })
    setRewardCondition('')
    setRewardDescription('')
    setShowRewardForm(false)
    loadData()
  }

  const handleDeleteReward = async (id: string) => {
    if (!window.confirm('Delete this reward?')) return
    await api.deleteReward(id)
    loadData()
  }

  const handleToggleOptOut = async () => {
    const newValue = !leaderboardOptOut
    await api.updateDedicationSettings({ leaderboardOptOut: newValue })
    setLeaderboardOptOut(newValue)
    loadData()
  }

  const handleUpdateFrequency = async (e: FormEvent) => {
    e.preventDefault()
    if (!traineeId) return
    await api.updateDedicationSettings({ traineeId, minWeeklyFrequency: Number(newFrequency) })
    setEditingFrequency(false)
    loadData()
  }

  const handleCreateChallenge = async (e: FormEvent) => {
    e.preventDefault()
    await api.createChallenge({
      title: challengeTitle,
      description: challengeDescription,
      type: challengeType,
      startDate: new Date(challengeStartDate).toISOString(),
      endDate: new Date(challengeEndDate).toISOString(),
    })
    setChallengeTitle('')
    setChallengeDescription('')
    setChallengeType('most_workouts')
    setChallengeStartDate('')
    setChallengeEndDate('')
    setShowChallengeForm(false)
    loadData()
  }

  const handleDeleteChallenge = async (id: string) => {
    if (!window.confirm('Delete this challenge?')) return
    await api.deleteChallenge(id)
    loadData()
  }

  const allChallenges = [...challengeData.active, ...challengeData.upcoming, ...challengeData.past]

  const earnedKeys = new Set(stats?.badges.map((b) => b.key) ?? [])
  const backPath = isTrainer
    ? `/trainees/${traineeId}/sessions`
    : '/sessions'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={backPath}>
              <Button variant="ghost" size="sm">&larr; Back</Button>
            </Link>
            <div className="flex items-center">
              <img src="/logo.png" alt="Meamen" className="h-16 w-auto object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-2xl font-semibold">Dedication</h2>

        {!stats ? (
          <p className="text-muted-foreground text-center py-12">Loading...</p>
        ) : (
          <>
            {/* Streak + Heatmap */}
            <Card>
              <CardContent className="!pt-4">
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="text-center">
                    <div className="text-3xl">{stats.currentStreakWeeks > 0 ? '🔥' : '💤'}</div>
                    <div className="text-2xl font-bold">{stats.currentStreakWeeks}</div>
                    <div className="text-xs text-muted-foreground">week streak</div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-base font-semibold">{stats.longestStreakWeeks}</div>
                      <div className="text-[11px] text-muted-foreground">longest streak</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold">{stats.perfectWeeks}</div>
                      <div className="text-[11px] text-muted-foreground">perfect weeks</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold">{stats.totalWorkoutDays}</div>
                      <div className="text-[11px] text-muted-foreground">workout days</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold">{stats.minWeeklyFrequency}x</div>
                      <div className="text-[11px] text-muted-foreground">per week goal</div>
                      {isTrainer && traineeId && (
                        <button className="text-[10px] text-muted-foreground underline mt-0.5" onClick={() => { setNewFrequency(String(stats.minWeeklyFrequency)); setEditingFrequency(!editingFrequency) }}>
                          edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {editingFrequency && (
                  <form onSubmit={handleUpdateFrequency} className="mt-3 flex gap-2 items-end">
                    <div>
                      <Label className="text-xs">Weekly goal</Label>
                      <Input type="number" min="1" max="7" value={newFrequency} onChange={(e) => setNewFrequency(e.target.value)} className="w-20" />
                    </div>
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingFrequency(false)}>Cancel</Button>
                  </form>
                )}
                <div className="mt-4 pt-3 border-t border-border/40">
                  <WorkoutHeatmap activityDays={stats.activityDays} />
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {allBadges.map((b) => (
                    <BadgeIcon
                      key={b.key}
                      icon={b.icon}
                      name={b.name}
                      description={b.description}
                      earned={earnedKeys.has(b.key)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Challenges</CardTitle>
                {isTrainer && (
                  <Button size="sm" variant="outline" onClick={() => setShowChallengeForm(!showChallengeForm)}>
                    {showChallengeForm ? 'Cancel' : 'New Challenge'}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {showChallengeForm && (
                  <form onSubmit={handleCreateChallenge} className="mb-4 space-y-3 p-3 border rounded-md bg-secondary/30">
                    <div className="space-y-2">
                      <Label className="text-xs">Title</Label>
                      <Input value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} placeholder="Week 1: Push harder!" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Description (optional)</Label>
                      <Input value={challengeDescription} onChange={(e) => setChallengeDescription(e.target.value)} placeholder="Who can log the most workout days this week?" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <select
                        value={challengeType}
                        onChange={(e) => setChallengeType(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="most_workouts">Most Workout Days</option>
                        <option value="total_weight">Total Volume (weight x reps x sets)</option>
                        <option value="consistency">Consistency (% days active)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Start Date</Label>
                        <Input type="date" value={challengeStartDate} onChange={(e) => setChallengeStartDate(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">End Date</Label>
                        <Input type="date" value={challengeEndDate} onChange={(e) => setChallengeEndDate(e.target.value)} required />
                      </div>
                    </div>
                    <Button type="submit" size="sm">Create Challenge</Button>
                  </form>
                )}
                {allChallenges.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No challenges yet.</p>
                ) : (
                  <div className="space-y-3">
                    {challengeData.active.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">Active Now</div>
                        {challengeData.active.map((ch) => (
                          <div key={ch.id} className="relative">
                            <ChallengeCard challenge={ch} currentUserId={user?.id} />
                            {isTrainer && (
                              <button
                                className="absolute top-3 right-3 text-xs text-muted-foreground hover:text-destructive z-10"
                                onClick={(e) => { e.stopPropagation(); handleDeleteChallenge(ch.id) }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {challengeData.upcoming.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Upcoming</div>
                        {challengeData.upcoming.map((ch) => (
                          <div key={ch.id} className="relative">
                            <ChallengeCard challenge={ch} currentUserId={user?.id} />
                            {isTrainer && (
                              <button
                                className="absolute top-3 right-3 text-xs text-muted-foreground hover:text-destructive z-10"
                                onClick={(e) => { e.stopPropagation(); handleDeleteChallenge(ch.id) }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {challengeData.past.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</div>
                        {challengeData.past.slice(0, 3).map((ch) => (
                          <div key={ch.id} className="relative">
                            <ChallengeCard challenge={ch} currentUserId={user?.id} />
                            {isTrainer && (
                              <button
                                className="absolute top-3 right-3 text-xs text-muted-foreground hover:text-destructive z-10"
                                onClick={(e) => { e.stopPropagation(); handleDeleteChallenge(ch.id) }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Rewards</CardTitle>
                {isTrainer && (
                  <Button size="sm" variant="outline" onClick={() => setShowRewardForm(!showRewardForm)}>
                    {showRewardForm ? 'Cancel' : 'Add Reward'}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {showRewardForm && (
                  <form onSubmit={handleCreateReward} className="mb-4 space-y-3 p-3 border rounded-md bg-secondary/30">
                    <div className="space-y-2">
                      <Label className="text-xs">Condition (e.g. streak:4, workouts:50, badge:first_pr)</Label>
                      <Input value={rewardCondition} onChange={(e) => setRewardCondition(e.target.value)} placeholder="streak:4" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Description</Label>
                      <Input value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} placeholder="Free protein shake!" required />
                    </div>
                    <Button type="submit" size="sm">Create</Button>
                  </form>
                )}
                {rewards.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No rewards defined yet.</p>
                ) : (
                  <div className="space-y-2">
                    {rewards.map((r) => (
                      <div key={r.id} className={`flex items-center justify-between p-3 rounded-md border ${r.met ? 'bg-green-50 border-green-200' : 'bg-background'}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{r.met ? '✅' : '⬜'}</span>
                            <span className="text-sm font-medium">{r.description}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatCondition(r.condition)}</span>
                        </div>
                        {isTrainer && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteReward(r.id)}>Delete</Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            {config.leaderboardEnabled && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Leaderboard</CardTitle>
                  {!isTrainer && (
                    <Button size="sm" variant="ghost" onClick={handleToggleOptOut}>
                      {leaderboardOptOut ? 'Opt In' : 'Opt Out'}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function formatCondition(condition: string): string {
  const [type, value] = condition.split(':')
  if (type === 'streak') return `${value}-week streak`
  if (type === 'workouts') return `${value} workout days`
  if (type === 'badge') return `Earn "${value}" badge`
  return condition
}
