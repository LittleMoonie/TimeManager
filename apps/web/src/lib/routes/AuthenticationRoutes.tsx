import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import MinimalLayout from '@/components/layout/MinimalLayout'

// Lazy load authentication components
const AuthLogin3 = lazy(() => import('@/features/auth/Login3'))
const AuthRegister3 = lazy(() => import('@/features/auth/Register3'))

/**
 * Legacy authentication routes for backward compatibility
 * These routes maintain the original /pages/login-3 structure
 */
function AuthenticationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MinimalLayout />}>
        <Route path="login-3" element={<AuthLogin3 />} />
        <Route path="register-3" element={<AuthRegister3 />} />
      </Route>
    </Routes>
  )
}

export default AuthenticationRoutes

