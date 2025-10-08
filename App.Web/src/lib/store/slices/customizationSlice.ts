import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CustomizationState } from '@/types/theme'
import { defaultThemeConfig } from '@/types/theme'

const initialState: CustomizationState = {
  isOpen: [], // for active default menu
  fontFamily: defaultThemeConfig.fontFamily,
  borderRadius: defaultThemeConfig.borderRadius,
  opened: defaultThemeConfig.opened,
  navType: defaultThemeConfig.navType,
}

const customizationSlice = createSlice({
  name: 'customization',
  initialState,
  reducers: {
    menuOpen: (state, action: PayloadAction<string>) => {
      state.isOpen = [action.payload]
    },
    setMenu: (state, action: PayloadAction<boolean>) => {
      state.opened = action.payload
    },
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.fontFamily = action.payload
    },
    setBorderRadius: (state, action: PayloadAction<number>) => {
      state.borderRadius = action.payload
    },
    setNavType: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.navType = action.payload
    },
  },
})

export const {
  menuOpen,
  setMenu,
  setFontFamily,
  setBorderRadius,
  setNavType,
} = customizationSlice.actions

export default customizationSlice.reducer

