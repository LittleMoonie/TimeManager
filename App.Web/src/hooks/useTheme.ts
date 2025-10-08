import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/lib/store/types'
import {
  menuOpen,
  setMenu,
  setFontFamily,
  setBorderRadius,
  setNavType,
} from '@/lib/store/slices/customizationSlice'

/**
 * Custom hook for theme and customization management
 * Provides easy access to theme state and actions
 */
export function useTheme() {
  const dispatch = useDispatch()
  const customization = useSelector((state: RootState) => state.customization)

  const actions = {
    openMenu: (id: string) => dispatch(menuOpen(id)),
    setMenuOpen: (opened: boolean) => dispatch(setMenu(opened)),
    changeFontFamily: (fontFamily: string) => dispatch(setFontFamily(fontFamily)),
    changeBorderRadius: (borderRadius: number) => dispatch(setBorderRadius(borderRadius)),
    changeNavType: (navType: 'light' | 'dark') => dispatch(setNavType(navType)),
  }

  return {
    customization,
    ...actions,
  }
}

export default useTheme
