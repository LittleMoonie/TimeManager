import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Alert, Box, Button, Card, CardContent, Container, TextField, Typography,
} from '@mui/material'
import { AuthenticationService } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email/Username is required'),
})

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setIsSubmitting(true)
    setSubmitSuccess(false)
    setSubmitError(null)
    try {
      await AuthenticationService.forgotPassword({ requestBody: { identifier: data.identifier } })
      setSubmitSuccess(true)
    } catch (error: unknown) {
      setSubmitError((error as Error).message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) {
    return <LoadingSpinner message="Sending reset email..." />
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
        <Card sx={{ width: '100%', maxWidth: 480, borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {/* GoGoTime Logo Placeholder */}
              <Typography variant="h4" component="h1" fontWeight={700} color="primary.main" gutterBottom>
                GoGoTime
              </Typography>
              <Typography variant="h6" component="h2" gutterBottom>
                Forgot password?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your email address below and we’ll send you a password reset OTP.
              </Typography>
            </Box>

            {submitSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                If an account exists, we sent a code to your email.
              </Alert>
            ) : (
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                display="flex"
                flexDirection="column"
                gap={2}
              >
                {submitError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {submitError}
                  </Alert>
                )}
                <TextField
                  label="Email Address / Username"
                  type="text"
                  {...register('identifier')}
                  error={!!errors.identifier}
                  helperText={errors.identifier?.message}
                  fullWidth
                  required
                  autoFocus
                />
                <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
                  Send Mail
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                <RouterLink to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Return to Sign In
                </RouterLink>
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 4 }}>
              Account creation is disabled. Contact your administrator.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default ForgotPasswordPage
