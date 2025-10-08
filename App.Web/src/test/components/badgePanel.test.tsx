import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import dayjs from 'dayjs'
import { StyledEngineProvider, ThemeProvider, CssBaseline } from '@mui/material'
import { act } from 'react-dom/test-utils'

import BadgePanel from '@/panels/BadgePanel'
import { buildTheme } from '@/theme'
import { I18nProvider } from '@/i18n'
import { useAuthStore, useDataStore, useOrgStore } from '@/store'
import { dataSource } from '@/api/dataSource'

const renderWithProviders = (ui: ReactNode) => {
  return render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={buildTheme('light', 'comfortable')}>
        <CssBaseline />
        <I18nProvider>{ui}</I18nProvider>
      </ThemeProvider>
    </StyledEngineProvider>,
  )
}

describe('BadgePanel', () => {
  beforeEach(() => {
    const org = dataSource.getOrganization()
    const user = dataSource.listUsers().find((entry) => entry.role === 'USER')!
    act(() => {
      useAuthStore.setState({ currentUserId: user.id, currentUser: user })
      useOrgStore.setState({ organization: org, loading: false })
      useDataStore.setState({
        clockEvents: [
          {
            id: 'evt-in',
            orgId: org.id,
            userId: user.id,
            type: 'IN',
            timestamp: dayjs().startOf('day').add(9, 'hour').toISOString(),
          },
        ],
        users: dataSource.listUsers(),
        announcements: [],
        activity: [],
      })
    })
  })

  it('disables clock-in button when already working', () => {
    renderWithProviders(<BadgePanel />)

    const clockInButton = screen.getByRole('button', { name: /clock in/i })
    expect(clockInButton).toBeDisabled()
  })

  it('shows working status chip when session active', () => {
    renderWithProviders(<BadgePanel />)

    expect(screen.getByText(/Working/i)).toBeInTheDocument()
  })
})
