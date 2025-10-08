import { Suspense, ComponentType, LazyExoticComponent } from 'react'
import Loader from '@/components/common/Loader'

/**
 * Higher-order component for lazy loading components
 * Wraps lazy components with Suspense and loading fallback
 */
function Loadable<T extends ComponentType<any>>(
  Component: LazyExoticComponent<T>
) {
  return function LoadableComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

export default Loadable
