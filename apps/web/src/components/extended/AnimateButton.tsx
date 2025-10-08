import { forwardRef, ReactNode } from 'react'
import { motion, useCycle } from 'framer-motion'

// Type definitions for animation props
type AnimationType = 'slide' | 'scale' | 'rotate'
type Direction = 'up' | 'down' | 'left' | 'right'

interface ScaleConfig {
  hover: number
  tap: number
}

interface AnimateButtonProps {
  children: ReactNode
  type?: AnimationType
  direction?: Direction
  offset?: number
  scale?: number | ScaleConfig
}

/**
 * Animated Button Component with Framer Motion
 * Converted from ui-component/extended/AnimateButton.js
 */
const AnimateButton = forwardRef<HTMLDivElement, AnimateButtonProps>(
  ({ 
    children, 
    type = 'scale', 
    direction = 'right', 
    offset = 10, 
    scale = { hover: 1, tap: 0.9 } 
  }, ref) => {
    
    // Calculate offset values based on direction
    let offset1: number
    let offset2: number
    
    switch (direction) {
      case 'up':
      case 'left':
        offset1 = offset
        offset2 = 0
        break
      case 'right':
      case 'down':
      default:
        offset1 = 0
        offset2 = offset
        break
    }

    const [x, cycleX] = useCycle(offset1, offset2)
    const [y, cycleY] = useCycle(offset1, offset2)

    switch (type) {
      case 'rotate':
        return (
          <motion.div
            ref={ref}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 2,
              repeatDelay: 0
            }}
          >
            {children}
          </motion.div>
        )

      case 'slide':
        if (direction === 'up' || direction === 'down') {
          return (
            <motion.div 
              ref={ref} 
              animate={{ y: y }} 
              onHoverEnd={() => cycleY()} 
              onHoverStart={() => cycleY()}
            >
              {children}
            </motion.div>
          )
        } else {
          return (
            <motion.div 
              ref={ref} 
              animate={{ x: x }} 
              onHoverEnd={() => cycleX()} 
              onHoverStart={() => cycleX()}
            >
              {children}
            </motion.div>
          )
        }

      case 'scale':
      default:
        // Convert number to ScaleConfig if needed
        let scaleConfig: ScaleConfig
        if (typeof scale === 'number') {
          scaleConfig = {
            hover: scale,
            tap: scale
          }
        } else {
          scaleConfig = scale
        }

        return (
          <motion.div 
            ref={ref} 
            whileHover={{ scale: scaleConfig.hover }} 
            whileTap={{ scale: scaleConfig.tap }}
          >
            {children}
          </motion.div>
        )
    }
  }
)

AnimateButton.displayName = 'AnimateButton'

export default AnimateButton

