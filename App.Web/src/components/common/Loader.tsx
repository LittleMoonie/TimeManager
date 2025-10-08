import { Box, LinearProgress } from '@mui/material'

/**
 * Loading component with linear progress
 * Converted from ui-component/Loader.js
 */
function Loader() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1301,
        width: '100%',
        '& > * + *': {
          mt: 2
        }
      }}
    >
      <LinearProgress color="primary" />
    </Box>
  )
}

export default Loader

