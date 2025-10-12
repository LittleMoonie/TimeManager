import type { ReactNode } from 'react'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/router'

interface AppProps {
  children?: ReactNode
}

export const App = ({ children }: AppProps) => {
  return <AppProviders>{children || <AppRouter />}</AppProviders>
}

export default App
