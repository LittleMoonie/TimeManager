import { Card, CardContent, Skeleton } from '@mui/material'

interface ImagePlaceholderProps {
  width?: number | string
  height?: number | string
}

/**
 * Image Placeholder Skeleton Component
 * TODO: Complete conversion from ui-component/cards/Skeleton/ImagePlaceholder.js
 */
function ImagePlaceholder({ width = '100%', height = 200 }: ImagePlaceholderProps) {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="rectangular" width={width} height={height} />
      </CardContent>
    </Card>
  )
}

export default ImagePlaceholder

