import React, { Suspense } from 'react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

const modules = import.meta.glob('/src/pages/**/*.tsx');

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

export function loadComponentForRoute(route: string, title: string | undefined): React.ReactNode {
  const parts = route.split('/').filter((p) => p);
  if (parts.length === 0) {
    return <PlaceholderPage title={title} />;
  }

  const pageName = toPascalCase(parts[parts.length - 1]);
  const componentName = `${pageName}Page`;
  const dirParts = parts.slice(0, -1);
  const path = `/src/pages/${[...dirParts, componentName].join('/')}.tsx`;

  const module = modules[path];
  if (module) {
    const Component = React.lazy(module as () => Promise<{ default: React.ComponentType }>);
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    );
  }

  return <PlaceholderPage title={title} />;
}
