import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })
  const { login, isLoggingIn, loginError } = useAuth()

  const handleChange =
    (field: 'email' | 'password') => (event: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials(prev => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await login(credentials)
    } catch {
      // Errors surfaced via loginError state
    }
  }

  if (isLoggingIn) {
    return <LoadingSpinner message="Signing you in..." />
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 420 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              GoGoTime
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Sign in to your account to access your workspace.
            </Typography>

            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError.message ?? 'Login failed. Please verify your credentials.'}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <TextField
                label="Email address"
                type="email"
                value={credentials.email}
                onChange={handleChange('email')}
                autoFocus
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={credentials.password}
                onChange={handleChange('password')}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!credentials.email || !credentials.password}
              >
                Sign In
              </Button>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: theme =>
                  theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Demo credentials
              </Typography>
              <Typography variant="body2">
                Email: admin@gogotime.com
                <br />
                Password: admin123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default LoginPage
