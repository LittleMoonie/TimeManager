import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Loadable from '@/components/common/Loadable'
import MainLayout from '@/components/layout/MainLayout'

// Dashboard routing
const DashboardDefault = Loadable(lazy(() => import('@/features/dashboard/DashboardDefault')))

// Utilities routing  
const UtilsTypography = Loadable(lazy(() => import('@/features/utilities/Typography')))
const UtilsColor = Loadable(lazy(() => import('@/features/utilities/Color')))
const UtilsShadow = Loadable(lazy(() => import('@/features/utilities/Shadow')))
const UtilsMaterialIcons = Loadable(lazy(() => import('@/features/utilities/MaterialIcons')))
const UtilsTablerIcons = Loadable(lazy(() => import('@/features/utilities/TablerIcons')))

// Sample page routing
const SamplePage = Loadable(lazy(() => import('@/features/sample-page')))

/**
 * Main application routes with authentication
 * Uses React Router v6 syntax
 */
function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Dashboard routes */}
        <Route path="dashboard" element={<DashboardDefault />} />
        
        {/* Utilities routes */}
        <Route path="utils">
          <Route path="typography" element={<UtilsTypography />} />
          <Route path="color" element={<UtilsColor />} />
          <Route path="shadow" element={<UtilsShadow />} />
        </Route>
        
        {/* Icon routes */}
        <Route path="icons">
          <Route path="tabler-icons" element={<UtilsTablerIcons />} />
          <Route path="material-icons" element={<UtilsMaterialIcons />} />
        </Route>
        
        {/* Sample page */}
        <Route path="sample-page" element={<SamplePage />} />
      </Route>
    </Routes>
  )
}

export default MainRoutes

