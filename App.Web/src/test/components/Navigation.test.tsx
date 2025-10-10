import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppThemeProvider } from '@/theme'
import { Navigation } from '@/layout/Navigation'

const renderNavigation = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <AppThemeProvider>
        <Navigation variant="permanent" open onClose={() => undefined} />
      </AppThemeProvider>
    </MemoryRouter>
  )

describe('<Navigation />', () => {
  it('matches snapshot', () => {
    const { container } = renderNavigation()
    expect(container.firstChild).toMatchSnapshot()
  })
})
