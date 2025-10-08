import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import NavigationScroll from '@/components/NavigationScroll'

describe('NavigationScroll', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <BrowserRouter>
        <NavigationScroll>
          <div>Test Content</div>
        </NavigationScroll>
      </BrowserRouter>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('scrolls to top when location changes', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    render(
      <BrowserRouter>
        <NavigationScroll>
          <div>Test Content</div>
        </NavigationScroll>
      </BrowserRouter>
    )

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })

    scrollToSpy.mockRestore()
  })
})

