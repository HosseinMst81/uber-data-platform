import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { TripsPage } from '@/pages/TripsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import NotfoundPage from '@/pages/NotfoundPage'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Car, DatabaseBackup } from 'lucide-react'
import { SQLAssistantPage } from './pages/SQLAssistantPage'

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-6 px-4">
          <span className="font-semibold">Uber Trip Data Platform</span>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Car className="h-4 w-4" />
              Trips
            </NavLink>
            <NavLink
              to="/sql-assistant"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <DatabaseBackup className="h-4 w-4" />
              SQL-Assistant
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container px-4 py-6">
        <Routes>
          <Route path="/" element={<TripsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sql-assistant" element={<SQLAssistantPage />} />
          <Route path="*" element={<NotfoundPage />} />
        </Routes>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
