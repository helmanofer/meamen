import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import Login from '@/pages/Login'
import TrainerDashboard from '@/pages/TrainerDashboard'
import TraineeSessions from '@/pages/TraineeSessions'
import SessionDetail from '@/pages/SessionDetail'
import ProgressDashboard from '@/pages/ProgressDashboard'
import Templates from '@/pages/Templates'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>
  }

  if (!user) {
    return <Routes>
      <Route path="*" element={<Login />} />
    </Routes>
  }

  if (user.role === 'TRAINER') {
    return (
      <Routes>
        <Route path="/" element={<TrainerDashboard />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/trainees/:traineeId/sessions" element={<TraineeSessions />} />
        <Route path="/trainees/:traineeId/progress" element={<ProgressDashboard />} />
        <Route path="/sessions/:sessionId" element={<SessionDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }

  // TRAINEE
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sessions" />} />
      <Route path="/sessions" element={<TraineeSessions />} />
      <Route path="/sessions/:sessionId" element={<SessionDetail />} />
      <Route path="/progress" element={<ProgressDashboard />} />
      <Route path="*" element={<Navigate to="/sessions" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
