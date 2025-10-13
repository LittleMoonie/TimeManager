import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email address or username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login({ identifier: data.identifier, password: data.password, rememberMe });
    } catch {
      // Errors surfaced via loginError state
    }
  };

  if (isLoggingIn) {
    return <LoadingSpinner message="Signing you in..." />;
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
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                color="primary.main"
                gutterBottom
              >
                GoGoTime
              </Typography>
              <Typography variant="h6" component="h2" gutterBottom>
                Hi, Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your credentials to continue.
              </Typography>
            </Box>

            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError.message ?? 'Invalid credentials. Please try again.'}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <TextField
                label="Email Address / Username"
                type="text"
                {...register('identifier')}
                error={!!errors.identifier}
                helperText={errors.identifier?.message}
                autoFocus
                required
                fullWidth
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message || 'Minimum 8 characters'}
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    name="rememberMe"
                    color="primary"
                  />
                }
                label="Keep me logged in"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoggingIn || !isValid}
              >
                Sign In
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                <RouterLink
                  to="/forgot-password"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  Forgot Password?
                </RouterLink>
              </Typography>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              display="block"
              sx={{ mt: 4 }}
            >
              Account creation is disabled. Contact your administrator.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
