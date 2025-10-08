import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import dayjs from 'dayjs'
import { StyledEngineProvider, ThemeProvider, CssBaseline } from '@mui/material'
import { act } from 'react-dom/test-utils'

import OverviewPanel from '@/panels/OverviewPanel'
import { buildTheme } from '@/theme'
import { I18nProvider } from '@/i18n'
import { useDataStore, useOrgStore } from '@/store'
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

describe('OverviewPanel', () => {
  beforeEach(() => {
    const org = dataSource.getOrganization()
    const user = dataSource.listUsers()[0]
    const inTs = dayjs().startOf('day').add(9, 'hour').toISOString()
    const outTs = dayjs().startOf('day').add(17, 'hour').toISOString()

    act(() => {
      useOrgStore.setState({ organization: org, loading: false })
      useDataStore.setState({
        clockEvents: [
          { id: '1', orgId: org.id, userId: user.id, type: 'IN', timestamp: inTs },
          { id: '2', orgId: org.id, userId: user.id, type: 'OUT', timestamp: outTs },
        ],
        users: dataSource.listUsers(),
        teams: dataSource.listTeams(),
        announcements: [],
        activity: [
          {
            id: 'activity_1',
            type: 'badge',
            message: 'Test user clocked in',
            timestamp: inTs,
          },
        ],
      })
    })
  })

  it('renders KPI cards and charts', () => {
    renderWithProviders(<OverviewPanel />)

    expect(screen.getByText(/On-Time Rate/i)).toBeInTheDocument()
    expect(screen.getByText(/Hours vs Late Rate/i)).toBeInTheDocument()
    expect(screen.getByText(/Recent activity/i)).toBeInTheDocument()
  })
})
