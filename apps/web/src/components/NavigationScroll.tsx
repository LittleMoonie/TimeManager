import { useEffect, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface NavigationScrollProps {
  children: ReactNode
}

/**
 * ScrollTop component - scrolls to top on route change
 * Preserves original Berry Dashboard behavior
 */
function NavigationScroll({ children }: NavigationScrollProps) {
  const location = useLocation()
  const { pathname } = location

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }, [pathname])

  return <>{children}</>
}

export default NavigationScroll

