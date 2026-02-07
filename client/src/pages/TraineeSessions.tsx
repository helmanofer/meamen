import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface Session {
  id: string
  name: string
  order: number
  trainee: { id: string; name: string }
  exercises: Array<{ id: string; name: string }>
}

interface Template {
  id: string
  name: string
  exercises: Array<{ id: string; name: string; sets: number; reps: number | null }>
}

function EditSessionForm({ session, onDone }: { session: Session; onDone: () => void }) {
  const [name, setName] = useState(session.name)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    try {
      await api.updateSession(session.id, { name })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} required />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm">Save</Button>
      <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
    </form>
  )
}

export default function TraineeSessions() {
  const { user, logout } = useAuth()
  const { traineeId } = useParams<{ traineeId: string }>()
  const [sessions, setSessions] = useState<Session[]>([])
  const [showForm, setShowForm] = useState<false | 'scratch' | 'template'>(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sessionName, setSessionName] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const navigate = useNavigate()
  const isTrainer = user?.role === 'TRAINER'

  const loadSessions = useCallback(() => {
    const id = isTrainer ? traineeId : undefined
    api.getSessions(id).then(setSessions).catch(console.error)
  }, [isTrainer, traineeId])

  useEffect(() => { loadSessions() }, [loadSessions])

  const loadTemplates = useCallback(() => {
    if (isTrainer) {
      api.getTemplates().then(setTemplates).catch(console.error)
    }
  }, [isTrainer])

  useEffect(() => { loadTemplates() }, [loadTemplates])

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!traineeId) return
    await api.createSession({ name: sessionName, traineeId, order: sessions.length })
    setSessionName('')
    setShowForm(false)
    loadSessions()
  }

  const handleCreateFromTemplate = async () => {
    if (!traineeId || !selectedTemplateId) return
    await api.createSessionFromTemplate({ templateId: selectedTemplateId, traineeId })
    setSelectedTemplateId(null)
    setShowForm(false)
    loadSessions()
  }

  const handleDelete = async (id: string) => {
    await api.deleteSession(id)
    loadSessions()
  }

  const traineeName = sessions[0]?.trainee?.name || 'Trainee'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isTrainer && (
              <Link to="/">
                <Button variant="ghost" size="sm">&larr; Back</Button>
              </Link>
            )}
            <h1 className="text-xl font-bold">Meamen</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {isTrainer ? `${traineeName}'s Sessions` : 'My Sessions'}
          </h2>
          <div className="flex gap-2">
            <Link to={isTrainer ? `/trainees/${traineeId}/progress` : '/progress'}>
              <Button variant="outline">View Progress</Button>
            </Link>
            {isTrainer && (
              showForm ? (
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowForm('template')}>From Template</Button>
                  <Button onClick={() => setShowForm('scratch')}>From Scratch</Button>
                </div>
              )
            )}
          </div>
        </div>

        {showForm === 'scratch' && (
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              placeholder="Session name (e.g. Leg Day)"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
            />
            <Button type="submit">Create</Button>
          </form>
        )}

        {showForm === 'template' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm font-medium">Choose a template</p>
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No templates available. <Link to="/templates" className="underline">Create one</Link></p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedTemplateId === t.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                        }`}
                        onClick={() => setSelectedTemplateId(selectedTemplateId === t.id ? null : t.id)}
                      >
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}
                          {t.exercises.length > 0 && `: ${t.exercises.map((e) => e.name).join(', ')}`}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    disabled={!selectedTemplateId}
                    onClick={handleCreateFromTemplate}
                  >
                    Create Session
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No sessions yet.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <Card
                key={s.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => { if (editingId !== s.id) navigate(`/sessions/${s.id}`) }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    <CardTitle>{s.name}</CardTitle>
                    <CardDescription>
                      {s.exercises.length} exercise{s.exercises.length !== 1 ? 's' : ''}
                    </CardDescription>
                    {editingId === s.id && (
                      <EditSessionForm
                        session={s}
                        onDone={() => { setEditingId(null); loadSessions() }}
                      />
                    )}
                  </div>
                  {isTrainer && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingId(editingId === s.id ? null : s.id)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(s.id)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
