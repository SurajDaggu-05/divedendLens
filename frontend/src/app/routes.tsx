import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { EnvironmentPage } from '@/app/EnvironmentPage'

export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<EnvironmentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
