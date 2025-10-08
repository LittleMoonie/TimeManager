import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'

/**
 * Minimal layout for authentication pages
 * Preserves original Berry Dashboard auth layout structure
 */
function MinimalLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          zIndex: 1,
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '450px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default MinimalLayout

