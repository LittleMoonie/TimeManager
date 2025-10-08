import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useTheme } from '@/hooks/useTheme'
import customizationReducer from '@/lib/store/slices/customizationSlice'

const createTestStore = () => configureStore({
  reducer: {
    customization: customizationReducer,
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createTestStore()
  return <Provider store={store}>{children}</Provider>
}

describe('useTheme', () => {
  it('returns customization state', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    expect(result.current.customization).toBeDefined()
    expect(result.current.customization.fontFamily).toBe("'Roboto', sans-serif")
    expect(result.current.customization.borderRadius).toBe(12)
    expect(result.current.customization.opened).toBe(true)
  })

  it('provides theme action methods', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    expect(typeof result.current.openMenu).toBe('function')
    expect(typeof result.current.setMenuOpen).toBe('function')
    expect(typeof result.current.changeFontFamily).toBe('function')
    expect(typeof result.current.changeBorderRadius).toBe('function')
    expect(typeof result.current.changeNavType).toBe('function')
  })

  it('updates border radius when called', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.changeBorderRadius(8)
    })
    
    expect(result.current.customization.borderRadius).toBe(8)
  })

  it('updates font family when called', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.changeFontFamily("'Inter', sans-serif")
    })
    
    expect(result.current.customization.fontFamily).toBe("'Inter', sans-serif")
  })
})

