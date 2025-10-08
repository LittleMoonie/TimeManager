import { ReactNode } from 'react'
import { useTheme } from '@mui/material/styles'
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

// Interface for SubCard props
interface SubCardProps {
  children?: ReactNode
  content?: boolean
  contentClass?: string
  darkTitle?: boolean
  secondary?: ReactNode
  sx?: SxProps<Theme>
  title?: ReactNode
  [key: string]: any // For spread props
}

/**
 * Custom Sub Card Component
 * Converted from ui-component/cards/SubCard.js
 */
function SubCard({ 
  children, 
  content = true, 
  contentClass, 
  darkTitle, 
  secondary, 
  sx = {}, 
  title, 
  ...others 
}: SubCardProps) {
  const theme = useTheme()

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: theme.palette.primary.light,
        ':hover': {
          boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)'
        },
        ...sx
      }}
      {...others}
    >
      {/* Card header and action */}
      {!darkTitle && title && (
        <CardHeader 
          sx={{ p: 2.5 }} 
          title={<Typography variant="h5">{title}</Typography>} 
          action={secondary} 
        />
      )}
      {darkTitle && title && (
        <CardHeader 
          sx={{ p: 2.5 }} 
          title={<Typography variant="h4">{title}</Typography>} 
          action={secondary} 
        />
      )}

      {/* Content & header divider */}
      {title && (
        <Divider
          sx={{
            opacity: 1,
            borderColor: theme.palette.primary.light
          }}
        />
      )}

      {/* Card content */}
      {content && (
        <CardContent sx={{ p: 2.5 }} className={contentClass}>
          {children}
        </CardContent>
      )}
      {!content && children}
    </Card>
  )
}

export default SubCard

