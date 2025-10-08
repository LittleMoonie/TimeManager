import { forwardRef, ReactNode } from 'react'
import { useTheme } from '@mui/material/styles'
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

// Interface for MainCard props
interface MainCardProps {
  border?: boolean
  boxShadow?: boolean
  children?: ReactNode
  content?: boolean
  contentClass?: string
  contentSX?: SxProps<Theme>
  darkTitle?: boolean
  secondary?: ReactNode
  shadow?: string
  sx?: SxProps<Theme>
  title?: ReactNode
  [key: string]: any // For spread props
}

// Header styles constant
const headerSX: SxProps<Theme> = {
  '& .MuiCardHeader-action': { mr: 0 }
}

/**
 * Custom Main Card Component
 * Converted from ui-component/cards/MainCard.js
 */
const MainCard = forwardRef<HTMLDivElement, MainCardProps>(
  (
    {
      border = true,
      boxShadow,
      children,
      content = true,
      contentClass,
      contentSX,
      darkTitle,
      secondary,
      shadow,
      sx = {},
      title,
      ...others
    },
    ref
  ) => {
    const theme = useTheme()

    return (
      <Card
        ref={ref}
        {...others}
        sx={{
          border: border ? '1px solid' : 'none',
          borderColor: theme.palette.primary.light + '4D', // 75 in hex is 4D
          ':hover': {
            boxShadow: boxShadow 
              ? (shadow ? shadow : '0 2px 14px 0 rgb(32 40 45 / 8%)') 
              : 'inherit'
          },
          ...sx
        }}
      >
        {/* Card header and action */}
        {!darkTitle && title && (
          <CardHeader sx={headerSX} title={title} action={secondary} />
        )}
        {darkTitle && title && (
          <CardHeader 
            sx={headerSX} 
            title={<Typography variant="h3">{title}</Typography>} 
            action={secondary} 
          />
        )}

        {/* Content & header divider */}
        {title && <Divider />}

        {/* Card content */}
        {content && (
          <CardContent sx={contentSX} className={contentClass}>
            {children}
          </CardContent>
        )}
        {!content && children}
      </Card>
    )
  }
)

MainCard.displayName = 'MainCard'

export default MainCard
