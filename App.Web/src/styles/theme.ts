import { createTheme, Theme } from '@mui/material/styles'
import type { ThemeCustomization } from '@/types/theme'

// Berry Dashboard color palette - preserved from original SCSS
const berryColors = {
  // paper & background
  paper: '#ffffff',
  
  // primary
  primaryLight: '#e3f2fd',
  primaryMain: '#2196f3',
  primaryDark: '#1e88e5',
  primary200: '#90caf9',
  primary800: '#1565c0',
  
  // secondary  
  secondaryLight: '#ede7f6',
  secondaryMain: '#673ab7',
  secondaryDark: '#5e35b1',
  secondary200: '#b39ddb',
  secondary800: '#4527a0',
  
  // success
  successLight: '#b9f6ca',
  success200: '#69f0ae',
  successMain: '#00e676',
  successDark: '#00c853',
  
  // error
  errorLight: '#ef9a9a',
  errorMain: '#f44336',
  errorDark: '#c62828',
  
  // orange
  orangeLight: '#fbe9e7',
  orangeMain: '#ffab91',
  orangeDark: '#d84315',
  
  // warning
  warningLight: '#fff8e1',
  warningMain: '#ffe57f',
  warningDark: '#ffc107',
  
  // grey
  grey50: '#fafafa',
  grey100: '#f5f5f5',
  grey200: '#eeeeee',
  grey300: '#e0e0e0',
  grey400: '#bdbdbd', // Added missing grey400
  grey500: '#9e9e9e',
  grey600: '#757575',
  grey700: '#616161',
  grey900: '#212121',
} as const

/**
 * Create Berry Dashboard theme with customization options
 * Preserves exact visual appearance of original theme
 */
export function theme(customization: ThemeCustomization = {}): Theme {
  const {
    fontFamily = "'Roboto', sans-serif",
    borderRadius = 12,
    navType = 'light'
  } = customization

  // Theme option object matching original structure
  const themeOption = {
    colors: berryColors,
    heading: berryColors.grey900,
    paper: berryColors.paper,
    backgroundDefault: berryColors.paper,
    background: berryColors.primaryLight,
    darkTextPrimary: berryColors.grey700,
    darkTextSecondary: berryColors.grey500,
    textDark: berryColors.grey900,
    menuSelected: berryColors.secondaryDark,
    menuSelectedBack: berryColors.secondaryLight,
    divider: berryColors.grey200,
    customization: { fontFamily, borderRadius, navType }
  }

  return createTheme({
    direction: 'ltr',
    palette: {
      mode: navType,
      common: {
        black: '#000000'
      },
      primary: {
        light: berryColors.primaryLight,
        main: berryColors.primaryMain,
        dark: berryColors.primaryDark,
        // @ts-ignore - MUI palette extension
        200: berryColors.primary200,
        800: berryColors.primary800
      },
      secondary: {
        light: berryColors.secondaryLight,
        main: berryColors.secondaryMain,
        dark: berryColors.secondaryDark,
        // @ts-ignore - MUI palette extension  
        200: berryColors.secondary200,
        800: berryColors.secondary800
      },
      error: {
        light: berryColors.errorLight,
        main: berryColors.errorMain,
        dark: berryColors.errorDark
      },
      // @ts-ignore - Custom color extension
      orange: {
        light: berryColors.orangeLight,
        main: berryColors.orangeMain,
        dark: berryColors.orangeDark
      },
      warning: {
        light: berryColors.warningLight,
        main: berryColors.warningMain,
        dark: berryColors.warningDark
      },
      success: {
        light: berryColors.successLight,
        main: berryColors.successMain,
        dark: berryColors.successDark,
        // @ts-ignore - MUI palette extension
        200: berryColors.success200
      },
      grey: {
        50: berryColors.grey50,
        100: berryColors.grey100,
        500: themeOption.darkTextSecondary,
        600: themeOption.heading,
        700: themeOption.darkTextPrimary,
        900: themeOption.textDark
      },
      text: {
        primary: themeOption.darkTextPrimary,
        secondary: themeOption.darkTextSecondary
      },
      background: {
        paper: themeOption.paper,
        default: themeOption.backgroundDefault
      }
    },
    mixins: {
      toolbar: {
        minHeight: '48px',
        padding: '16px',
        '@media (min-width: 600px)': {
          minHeight: '48px'
        }
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920
      }
    },
    typography: {
      fontFamily: fontFamily,
      h6: {
        fontWeight: 500,
        color: themeOption.heading,
        fontSize: '0.75rem'
      },
      h5: {
        fontSize: '0.875rem',
        color: themeOption.heading,
        fontWeight: 500
      },
      h4: {
        fontSize: '1rem',
        color: themeOption.heading,
        fontWeight: 600
      },
      h3: {
        fontSize: '1.25rem',
        color: themeOption.heading,
        fontWeight: 600
      },
      h2: {
        fontSize: '1.5rem',
        color: themeOption.heading,
        fontWeight: 700
      },
      h1: {
        fontSize: '2.125rem',
        color: themeOption.heading,
        fontWeight: 700
      },
      subtitle1: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: themeOption.textDark
      },
      subtitle2: {
        fontSize: '0.75rem',
        fontWeight: 400,
        color: themeOption.darkTextSecondary
      },
      caption: {
        fontSize: '0.75rem',
        color: themeOption.darkTextSecondary,
        fontWeight: 400
      },
      body1: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '1.334em'
      },
      body2: {
        letterSpacing: '0em',
        fontWeight: 400,
        lineHeight: '1.5em',
        color: themeOption.darkTextPrimary
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            textTransform: 'capitalize',
            borderRadius: '4px'
          }
        }
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          },
          rounded: {
            borderRadius: borderRadius + 'px'
          }
        }
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            color: berryColors.grey900,
            padding: '24px'
          },
          title: {
            fontSize: '1.125rem'
          }
        }
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '24px'
          }
        }
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            padding: '24px'
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            color: themeOption.darkTextPrimary,
            paddingTop: '10px',
            paddingBottom: '10px',
            '&.Mui-selected': {
              color: themeOption.menuSelected,
              backgroundColor: themeOption.menuSelectedBack,
              '&:hover': {
                backgroundColor: themeOption.menuSelectedBack
              },
              '& .MuiListItemIcon-root': {
                color: themeOption.menuSelected
              }
            },
            '&:hover': {
              backgroundColor: themeOption.menuSelectedBack,
              color: themeOption.menuSelected,
              '& .MuiListItemIcon-root': {
                color: themeOption.menuSelected
              }
            }
          }
        }
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: themeOption.darkTextPrimary,
            minWidth: '36px'
          }
        }
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: themeOption.textDark
          }
        }
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            color: themeOption.textDark,
            '&::placeholder': {
              color: themeOption.darkTextSecondary,
              fontSize: '0.875rem'
            }
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            background: berryColors.grey50,
            borderRadius: borderRadius + 'px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: berryColors.grey400
            },
            '&:hover $notchedOutline': {
              borderColor: berryColors.primaryLight
            },
            '&.MuiInputBase-multiline': {
              padding: 1
            }
          },
          input: {
            fontWeight: 500,
            background: berryColors.grey50,
            padding: '15.5px 14px',
            borderRadius: borderRadius + 'px',
            '&.MuiInputBase-inputSizeSmall': {
              padding: '10px 14px',
              '&.MuiInputBase-inputAdornedStart': {
                paddingLeft: 0
              }
            }
          },
          inputAdornedStart: {
            paddingLeft: 4
          },
          notchedOutline: {
            borderRadius: borderRadius + 'px'
          }
        }
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            '&.Mui-disabled': {
              color: berryColors.grey300
            }
          },
          mark: {
            backgroundColor: berryColors.paper,
            width: '4px'
          },
          valueLabel: {
            color: berryColors.primaryLight
          }
        }
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: themeOption.divider,
            opacity: 1
          }
        }
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            color: berryColors.primaryDark,
            background: berryColors.primary200
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            '&.MuiChip-deletable .MuiChip-deleteIcon': {
              color: 'inherit'
            }
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            color: berryColors.paper,
            background: berryColors.grey700
          }
        }
      }
    }
  })
}

export default theme

/**
 * Theme Parity Note:
 * 
 * This theme preserves the exact Berry Dashboard appearance with these key elements:
 * - Primary: Blue (#2196f3) - main brand color
 * - Secondary: Purple (#673ab7) - accent and menu selection
 * - Typography: Roboto font family with specific font weights and sizes
 * - Border radius: 12px default (configurable)
 * - Component overrides: Buttons, cards, inputs, navigation items
 * 
 * To fine-tune visual parity:
 * 1. Compare component screenshots before/after migration
 * 2. Adjust borderRadius via customization prop (current: 12px)
 * 3. Verify menu selection colors match exactly
 * 4. Check input field styling and padding
 * 5. Ensure card elevation and shadows are consistent
 */

