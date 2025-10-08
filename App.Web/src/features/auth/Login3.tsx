import { useState } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface LoginFormData {
  email: string
  password: string
}

/**
 * Login page component (Style 3)
 * TODO: Migrate from views/pages/authentication/authentication3/Login3.js
 */
function Login3() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string>('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    // TODO: Replace with actual authentication logic
    try {
      console.log('Login attempt:', formData)
      // Simulate login success
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <Card elevation={16} sx={{ maxWidth: 400, width: '100%' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Hi, Welcome Back
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Enter your credentials to continue
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Sign In
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              href="#"
              variant="body2"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Navigate to forgot password
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default Login3
