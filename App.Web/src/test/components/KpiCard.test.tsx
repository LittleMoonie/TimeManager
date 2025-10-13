import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCard } from '@/components/KpiCard';
import { AppThemeProvider } from '@/theme';
import { AccountBalanceWalletRounded } from '@mui/icons-material';

const withTheme = (node: React.ReactNode) => <AppThemeProvider>{node}</AppThemeProvider>;

describe('<KpiCard />', () => {
  it('matches snapshot for gradient variant', () => {
    const { container } = render(
      withTheme(
        <KpiCard
          title="Total Earning"
          value="$559.25K"
          subtitle="Compared to last week"
          delta={{ value: '+2.56%', trend: 'up' }}
          icon={<AccountBalanceWalletRounded fontSize="small" />}
          variant="gradient"
        />,
      ),
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
