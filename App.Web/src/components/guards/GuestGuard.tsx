import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DEFAULT_PATH } from '@/lib/constants'
import type { RootState } from '@/lib/store/types'

interface GuestGuardProps {
  children: ReactNode
}

/**
 * Guest guard for routes that should only be accessible to non-authenticated users
 * Converted from utils/route-guard/GuestGuard.js
 */
function GuestGuard({ children }: GuestGuardProps) {
  // TODO: Add account slice to store when implementing authentication
  // const account = useSelector((state: RootState) => state.account)
  // const { isLoggedIn } = account

  // For now, allow access (remove when auth is implemented)
  const isLoggedIn = false

  if (isLoggedIn) {
    return <Navigate to={DEFAULT_PATH} replace />
  }

  return <>{children}</>
}

export default GuestGuard
