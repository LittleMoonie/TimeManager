import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Route imports
import MainRoutes from '@/lib/routes/MainRoutes'
import AuthenticationRoutes from '@/lib/routes/AuthenticationRoutes'

// Components
import Loader from '@/components/common/Loader'

/**
 * Main application router
 * Simple React Router setup with main app routes and auth routes
 */
export function AppRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Main app routes */}
        <Route path="/*" element={<MainRoutes />} />
        
        {/* Auth routes */}
        <Route path="/pages/*" element={<AuthenticationRoutes />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
