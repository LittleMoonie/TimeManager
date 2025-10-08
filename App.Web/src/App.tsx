import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, StyledEngineProvider } from '@mui/material'
import { useSelector } from 'react-redux'

import { AppRouter } from '@/lib/router'
import { theme } from '@/styles/theme'
import NavigationScroll from '@/components/NavigationScroll'
import type { RootState } from '@/lib/store/types'

/**
 * Root App Component - Global providers and routing
 */
export default function App() {
  const customization = useSelector((state: RootState) => state.customization)

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme(customization)}>
        <CssBaseline />
        <BrowserRouter>
          <NavigationScroll>
            <AppRouter />
          </NavigationScroll>
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

