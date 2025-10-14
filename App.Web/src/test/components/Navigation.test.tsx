import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Navigation } from '@/layout/Navigation';
import { AppThemeProvider } from '@/theme';

const renderNavigation = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <AppThemeProvider>
        <Navigation variant="permanent" open onClose={() => undefined} />
      </AppThemeProvider>
    </MemoryRouter>,
  );

describe('<Navigation />', () => {
  it('matches snapshot', () => {
    const { container } = renderNavigation();
    expect(container.firstChild).toMatchSnapshot();
  });
});
