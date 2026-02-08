import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number | null
  weight: number | null
  duration: number | null
  youtubeUrl: string | null
  order: number
  notes: string | null
  logs: Array<{
    id: string
    setsCompleted: number | null
    repsCompleted: number | null
    weightUsed: number | null
    completedAt: string
    notes: string | null
  }>
}

interface SessionData {
  id: string
  name: string
  trainee: { id: string; name: string }
  exercises: Exercise[]
}

function YouTubeEmbed({ url }: { url: string }) {
  const videoId = url.match(/(?:youtu\.be\/|v=)([^&\s]+)/)?.[1]
  if (!videoId) return <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">Watch Video</a>
  return (
    <div className="aspect-video rounded-md overflow-hidden mt-2">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full h-full"
        allowFullScreen
        title="Exercise demo"
      />
    </div>
  )
}

function LogForm({ exerciseId, lastLog, onDone }: {
  exerciseId: string;
  lastLog?: { setsCompleted: number | null; repsCompleted: number | null; weightUsed: number | null; notes: string | null };
  onDone: (newBadges?: string[]) => void;
}) {
  const [sets, setSets] = useState(lastLog?.setsCompleted != null ? String(lastLog.setsCompleted) : '')
  const [reps, setReps] = useState(lastLog?.repsCompleted != null ? String(lastLog.repsCompleted) : '')
  const [weight, setWeight] = useState(lastLog?.weightUsed != null ? String(lastLog.weightUsed) : '')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = await api.logExercise(exerciseId, {
      setsCompleted: sets ? Number(sets) : undefined,
      repsCompleted: reps ? Number(reps) : undefined,
      weightUsed: weight ? Number(weight) : undefined,
      notes: notes || undefined,
    }) as { newBadges?: string[] }
    setSets('')
    setReps('')
    setWeight('')
    setNotes('')
    onDone(result.newBadges)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 border rounded-md space-y-3 bg-secondary/30">
      <p className="text-sm font-medium">Log your performance</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Sets</Label>
          <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" />
        </div>
        <div>
          <Label className="text-xs">Reps</Label>
          <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="10" />
        </div>
        <div>
          <Label className="text-xs">Weight (kg)</Label>
          <Input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="20" />
        </div>
      </div>
      <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button type="submit" size="sm">Save Log</Button>
    </form>
  )
}

function EditLogForm({ log, onDone }: { log: { id: string; setsCompleted: number | null; repsCompleted: number | null; weightUsed: number | null; notes: string | null }; onDone: () => void }) {
  const [sets, setSets] = useState(log.setsCompleted != null ? String(log.setsCompleted) : '')
  const [reps, setReps] = useState(log.repsCompleted != null ? String(log.repsCompleted) : '')
  const [weight, setWeight] = useState(log.weightUsed != null ? String(log.weightUsed) : '')
  const [notes, setNotes] = useState(log.notes ?? '')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await api.updateExerciseLog(log.id, {
      setsCompleted: sets ? Number(sets) : undefined,
      repsCompleted: reps ? Number(reps) : undefined,
      weightUsed: weight ? Number(weight) : undefined,
      notes: notes || undefined,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 p-2 border rounded-md space-y-2 bg-secondary/30">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Sets</Label>
          <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" />
        </div>
        <div>
          <Label className="text-xs">Reps</Label>
          <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="10" />
        </div>
        <div>
          <Label className="text-xs">Weight (kg)</Label>
          <Input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="20" />
        </div>
      </div>
      <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

function EditExerciseForm({ exercise, onDone }: { exercise: Exercise; onDone: () => void }) {
  const [name, setName] = useState(exercise.name)
  const [sets, setSets] = useState(String(exercise.sets))
  const [reps, setReps] = useState(exercise.reps != null ? String(exercise.reps) : '')
  const [weight, setWeight] = useState(exercise.weight != null ? String(exercise.weight) : '')
  const [duration, setDuration] = useState(exercise.duration != null ? String(exercise.duration) : '')
  const [youtubeUrl, setYoutubeUrl] = useState(exercise.youtubeUrl ?? '')
  const [notes, setNotes] = useState(exercise.notes ?? '')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await api.updateExercise(exercise.id, {
      name,
      sets: Number(sets),
      reps: reps ? Number(reps) : null,
      weight: weight ? Number(weight) : null,
      duration: duration ? Number(duration) : null,
      youtubeUrl: youtubeUrl || null,
      notes: notes || null,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 border rounded-md space-y-3 bg-secondary/30">
      <p className="text-sm font-medium">Edit Exercise</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label className="text-xs">YouTube URL</Label>
          <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Sets</Label>
          <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Reps</Label>
          <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="-" />
        </div>
        <div>
          <Label className="text-xs">Weight (kg)</Label>
          <Input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="-" />
        </div>
        <div>
          <Label className="text-xs">Duration (sec)</Label>
          <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="-" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Notes</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

function AddExerciseForm({ sessionId, order, onDone }: { sessionId: string; order: number; onDone: () => void }) {
  const [name, setName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [duration, setDuration] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await api.addExercise(sessionId, {
      name,
      sets: Number(sets),
      reps: reps ? Number(reps) : undefined,
      weight: weight ? Number(weight) : undefined,
      duration: duration ? Number(duration) : undefined,
      youtubeUrl: youtubeUrl || undefined,
      order,
      notes: notes || undefined,
    })
    setName('')
    setSets('3')
    setReps('')
    setWeight('')
    setDuration('')
    setYoutubeUrl('')
    setNotes('')
    onDone()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exercise Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Squat" required />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL (optional)</Label>
              <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Sets</Label>
              <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reps</Label>
              <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="-" />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="-" />
            </div>
            <div className="space-y-2">
              <Label>Duration (sec)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="-" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>
          <Button type="submit">Add Exercise</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function SessionDetail() {
  const { user, logout } = useAuth()
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<SessionData | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loggingExerciseId, setLoggingExerciseId] = useState<string | null>(null)
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null)
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [badgeAlert, setBadgeAlert] = useState<string[] | null>(null)
  const isTrainer = user?.role === 'TRAINER'

  const loadSession = useCallback(() => {
    if (!sessionId) return
    api.getSession(sessionId).then(setSession).catch(console.error)
  }, [sessionId])

  useEffect(() => { loadSession() }, [loadSession])

  const handleDeleteExercise = async (id: string) => {
    if (!window.confirm('Delete this exercise?')) return
    await api.deleteExercise(id)
    loadSession()
  }

  const handleDeleteLog = async (logId: string) => {
    if (!window.confirm('Delete this log entry?')) return
    await api.deleteExerciseLog(logId)
    loadSession()
  }

  if (!session) return <div className="p-8 text-center text-muted-foreground">Loading...</div>

  const backPath = isTrainer ? `/trainees/${session.trainee.id}/sessions` : '/sessions'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="relative max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 relative z-20">
            <Link to={backPath}>
              <Button variant="ghost" size="sm">&larr; Back</Button>
            </Link>
            <img src="/logo.png" alt="Meamen" className="h-12 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3 relative z-20">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {badgeAlert && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-900">New badge{badgeAlert.length > 1 ? 's' : ''} earned!</p>
              <p className="text-sm text-yellow-700">{badgeAlert.join(', ')}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setBadgeAlert(null)}>Dismiss</Button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{session.name}</h2>
            <p className="text-sm text-muted-foreground">{session.trainee.name}</p>
          </div>
          {isTrainer && (
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : 'Add Exercise'}
            </Button>
          )}
        </div>

        {showAddForm && (
          <AddExerciseForm
            sessionId={session.id}
            order={session.exercises.length}
            onDone={() => { setShowAddForm(false); loadSession() }}
          />
        )}

        {session.exercises.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No exercises yet.</p>
        ) : (
          <div className="space-y-3">
            {session.exercises.map((ex) => (
              <Card key={ex.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{ex.name}</CardTitle>
                    <CardDescription>
                      {ex.sets} sets
                      {ex.reps != null ? ` x ${ex.reps} reps` : ''}
                      {ex.weight != null ? ` @ ${ex.weight}kg` : ''}
                      {ex.duration != null ? ` | ${ex.duration}s` : ''}
                    </CardDescription>
                    {ex.notes && <p className="text-sm text-muted-foreground mt-1">{ex.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLoggingExerciseId(loggingExerciseId === ex.id ? null : ex.id)
                      }
                    >
                      {loggingExerciseId === ex.id ? 'Cancel' : 'Log'}
                    </Button>
                    {isTrainer && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingExerciseId(editingExerciseId === ex.id ? null : ex.id)}
                        >
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteExercise(ex.id)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                {(ex.youtubeUrl || editingExerciseId === ex.id || loggingExerciseId === ex.id || ex.logs.length > 0) && (
                  <CardContent>
                    {ex.youtubeUrl && <YouTubeEmbed url={ex.youtubeUrl} />}

                    {editingExerciseId === ex.id && (
                      <EditExerciseForm
                        exercise={ex}
                        onDone={() => { setEditingExerciseId(null); loadSession() }}
                      />
                    )}

                    {loggingExerciseId === ex.id && (
                      <LogForm exerciseId={ex.id} lastLog={ex.logs[0]} onDone={(newBadges) => {
                        setLoggingExerciseId(null)
                        loadSession()
                        if (newBadges && newBadges.length > 0) setBadgeAlert(newBadges)
                      }} />
                    )}

                    {ex.logs.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Logs</p>
                          <span className="text-xs text-muted-foreground">{ex.logs.length} log{ex.logs.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-2">
                          {ex.logs.map((log, idx) => (
                            <div key={log.id} className={`p-3 rounded-lg border ${idx === 0 ? 'bg-primary/5 border-primary/20' : 'bg-secondary/30 border-border/60'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {new Date(log.completedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                                  </span>
                                  {idx === 0 && <span className="hidden xs:inline text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">Latest</span>}
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setEditingLogId(editingLogId === log.id ? null : log.id)}
                                    className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                    title="Edit log"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLog(log.id)}
                                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Delete log"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs sm:text-sm">
                                {log.setsCompleted != null && (
                                  <span className="font-semibold">{log.setsCompleted}<span className="text-muted-foreground ml-0.5">sets</span></span>
                                )}
                                {log.repsCompleted != null && (
                                  <span className="font-semibold">{log.repsCompleted}<span className="text-muted-foreground ml-0.5">reps</span></span>
                                )}
                                {log.weightUsed != null && (
                                  <span className="font-semibold">{log.weightUsed}<span className="text-muted-foreground ml-0.5">kg</span></span>
                                )}
                              </div>
                              {log.notes && (
                                <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-2">"{log.notes}"</p>
                              )}
                              {editingLogId === log.id && (
                                <div className="mt-3 pt-2 border-t border-border/50">
                                  <EditLogForm log={log} onDone={() => { setEditingLogId(null); loadSession() }} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
