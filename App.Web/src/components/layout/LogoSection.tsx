import { ButtonBase } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { DEFAULT_PATH } from '@/lib/constants'

/**
 * Logo section component for header/sidebar
 */
function LogoSection() {
  const navigate = useNavigate()

  return (
    <ButtonBase 
      disableRipple 
      onClick={() => navigate(DEFAULT_PATH)}
      sx={{ 
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <Logo />
    </ButtonBase>
  )
}

export default LogoSection

