import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Trainee {
  id: string
  name: string
  email: string
}

function EditTraineeForm({ trainee, onDone }: { trainee: Trainee; onDone: () => void }) {
  const [name, setName] = useState(trainee.name)
  const [email, setEmail] = useState(trainee.email)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.updateTrainee(trainee.id, { name, email })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-2">
        <Label className="text-xs">Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

export default function TrainerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loadTrainees = () => {
    api.getTrainees().then(setTrainees).catch(console.error)
  }

  useEffect(() => { loadTrainees() }, [])

  const handleDelete = async (trainee: Trainee) => {
    if (!window.confirm(`Delete ${trainee.name}? This will remove them from your trainees.`)) return
    await api.removeTrainee(trainee.id)
    loadTrainees()
  }

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.addTrainee({ name, email, password })
      setName('')
      setEmail('')
      setPassword('')
      setShowForm(false)
      loadTrainees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trainee')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Meamen</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Trainees</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/templates')}>Templates</Button>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Add Trainee'}
            </Button>
          </div>
        </div>

        {showForm && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="t-name">Name</Label>
                    <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="t-email">Email</Label>
                    <Input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="t-pass">Password</Label>
                    <Input id="t-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit">Add Trainee</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {trainees.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No trainees yet. Add your first trainee to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainees.map((t) => (
              <Link key={t.id} to={`/trainees/${t.id}/sessions`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{t.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{t.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          setEditingId(editingId === t.id ? null : t.id)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(t)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                    {editingId === t.id && (
                      <EditTraineeForm
                        trainee={t}
                        onDone={() => { setEditingId(null); loadTrainees() }}
                      />
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
