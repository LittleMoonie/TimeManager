import { forwardRef, ReactNode } from 'react'
import { Avatar as MuiAvatar, AvatarProps } from '@mui/material'

interface ExtendedAvatarProps extends AvatarProps {
  children?: ReactNode
  size?: 'badge' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  outline?: boolean
  [key: string]: any // For other props spread
}

/**
 * Extended Avatar Component
 * TODO: Complete conversion from ui-component/extended/Avatar.js
 * For now, basic implementation
 */
const Avatar = forwardRef<HTMLDivElement, ExtendedAvatarProps>(
  ({ children, size = 'md', color = 'primary', outline = false, sx = {}, ...others }, ref) => {
    
    // Size mapping
    const sizeMap = {
      badge: { width: 20, height: 20 },
      xs: { width: 24, height: 24 },
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 56, height: 56 },
      xl: { width: 72, height: 72 },
    }

    const sizeStyles = sizeMap[size] || sizeMap.md

    return (
      <MuiAvatar
        ref={ref}
        sx={{
          ...sizeStyles,
          border: outline ? '2px solid' : 'none',
          ...sx,
        }}
        {...others}
      >
        {children}
      </MuiAvatar>
    )
  }
)

Avatar.displayName = 'Avatar'

export default Avatar

