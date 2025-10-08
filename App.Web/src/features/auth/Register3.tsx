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
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

/**
 * Register page component (Style 3)
 * TODO: Migrate from views/pages/authentication/authentication3/Register3.js
 */
function Register3() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [error, setError] = useState<string>('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    // TODO: Replace with actual registration logic
    try {
      console.log('Registration attempt:', formData)
      // Simulate registration success
      navigate('/auth/login')
    } catch (err) {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <Card elevation={16} sx={{ maxWidth: 400, width: '100%' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Sign up
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your account to get started
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              autoFocus
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </Box>

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleInputChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="agreeToTerms"
                color="primary"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="#" variant="body2" sx={{ fontWeight: 500 }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" variant="body2" sx={{ fontWeight: 500 }}>
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ mt: 1, alignItems: 'flex-start' }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Sign Up
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default Register3

