import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/store/types'

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Authentication guard for protected routes
 * Converted from utils/route-guard/AuthGuard.js
 */
function AuthGuard({ children }: AuthGuardProps) {
  // TODO: Add account slice to store when implementing authentication
  // const account = useSelector((state: RootState) => state.account)
  // const { isLoggedIn } = account

  // For now, allow access (remove when auth is implemented)
  const isLoggedIn = true

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

export default AuthGuard

