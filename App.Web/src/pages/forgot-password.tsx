import { Box, Button, Container, TextField, Typography } from '@mui/material';  
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const ForgotPasswordPage = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values: { email: string }) => {
      alert(JSON.stringify(values, null, 2));
      // TODO: Implement forgot password logic
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Reset Password
          </Button>
          <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Button fullWidth variant="text">
              Back to Login
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
