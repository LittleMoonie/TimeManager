import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ThemeProvider } from '@mui/material/styles'
import { vi } from 'vitest'
import Login3 from '@/features/auth/Login3'
import { theme } from '@/styles/theme'
import customizationReducer from '@/lib/store/slices/customizationSlice'

const mockStore = configureStore({
  reducer: {
    customization: customizationReducer,
  },
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={mockStore}>
    <ThemeProvider theme={theme()}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
)

describe('Login3', () => {
  it('renders login form correctly', () => {
    render(
      <TestWrapper>
        <Login3 />
      </TestWrapper>
    )

    expect(screen.getByText('Hi, Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles form input changes', async () => {
    render(
      <TestWrapper>
        <Login3 />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    await waitFor(() => {
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })
  })

  it('shows forgot password and sign up links', () => {
    render(
      <TestWrapper>
        <Login3 />
      </TestWrapper>
    )

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
  })
})

