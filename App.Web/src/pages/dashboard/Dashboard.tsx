import { useMemo, useState } from 'react';
import Grid from '@mui/material/GridLegacy';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { AccountBalanceWalletRounded, MoreHorizRounded, ShoppingBagRounded, TrendingUpRounded } from '@mui/icons-material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '@/components/KpiCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Sparkline } from '@/components/Sparkline';
import { growthSeries, kpiMetrics, orderSeries, popularInstruments, sparklineData } from './mockData';

type OrderPeriod = 'month' | 'year';
type GrowthPeriod = 'today' | 'week' | 'month';

const CardActionMenu = ({ anchorEl, onClose }: { anchorEl: HTMLElement | null; onClose: () => void }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    PaperProps={{
      elevation: 0,
      sx: {
        minWidth: 160,
        borderRadius: 2,
        boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.16)',
      },
    }}
  >
    <MenuItem onClick={onClose}>View details</MenuItem>
    <MenuItem onClick={onClose}>Download report</MenuItem>
  </Menu>
);

const GrowthChart = ({ period }: { period: GrowthPeriod }) => {
  const theme = useTheme();
  const data = growthSeries[period];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="growthDesktop" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor={alpha(theme.palette.primary.main, 0.55)} />
            <stop offset="95%" stopColor={alpha(theme.palette.primary.main, 0.05)} />
          </linearGradient>
          <linearGradient id="growthMobile" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor={alpha(theme.palette.info.main, 0.45)} />
            <stop offset="95%" stopColor={alpha(theme.palette.info.main, 0.04)} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: alpha(theme.palette.text.secondary, 0.8), fontSize: 12 }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: alpha(theme.palette.text.secondary, 0.7), fontSize: 12 }}
          width={50}
        />
        <RechartsTooltip
          cursor={{ strokeDasharray: '4 4' }}
          contentStyle={{
            borderRadius: 12,
            border: 'none',
            padding: '12px 16px',
            background: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.92 : 0.98),
            boxShadow: theme.shadows[3],
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="desktop"
          name="Desktop"
          stroke={theme.palette.primary.main}
          fill="url(#growthDesktop)"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
        <Area
          type="monotone"
          dataKey="mobile"
          name="Mobile"
          stroke={theme.palette.info.main}
          fill="url(#growthMobile)"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const PopularList = () => {
  const theme = useTheme();
  return (
    <Stack spacing={2.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed', opacity: 0.4 }} />}
      sx={{ mt: 1 }}
    >
      {popularInstruments.map((stock) => (
        <Stack key={stock.id} spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {stock.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stock.symbol}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Typography variant="subtitle2" fontWeight={600}>
                {stock.price}
              </Typography>
              <Chip
                label={stock.change}
                size="small"
                color={stock.positive ? 'success' : 'error'}
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Stack>
          <Sparkline
            data={stock.data}
            color={stock.positive ? theme.palette.success.main : theme.palette.error.main}
            ariaLabel={`${stock.name} price trend`}
          />
        </Stack>
      ))}
    </Stack>
  );
};

export const DashboardPage = () => {
  const theme = useTheme();
  const [orderPeriod, setOrderPeriod] = useState<OrderPeriod>('month');
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>('week');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const orderData = useMemo(() => orderSeries[orderPeriod], [orderPeriod]);

  return (
    <Grid container spacing={3} columns={12}>
      <Grid xs={12} md={6} lg={4}>
        <KpiCard
          title="Total Earning"
          value={kpiMetrics.totalEarning.value}
          subtitle={kpiMetrics.totalEarning.subtitle}
          delta={{ value: kpiMetrics.totalEarning.delta, trend: 'up' }}
          icon={<AccountBalanceWalletRounded fontSize="small" />}
          variant="gradient"
          color="primary"
          footer={
            <Sparkline
              data={sparklineData.earnings}
              color={theme.palette.common.white}
              ariaLabel="Total earning trend"
            />
          }
        />
      </Grid>

      <Grid xs={12} md={6} lg={4}>
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: theme.shadows[2] }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: '2rem', letterSpacing: '-0.015em' }}>
                    {kpiMetrics.totalOrder.value}
                  </Typography>
                  <Chip label={kpiMetrics.totalOrder.delta} color="success" size="small" />
                </Stack>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.12),
                    color: theme.palette.info.main,
                  }}
                >
                  <ShoppingBagRounded fontSize="small" />
                </Avatar>
              </Stack>
              <SegmentedControl
                options={[
                  { label: 'Month', value: 'month' },
                  { label: 'Year', value: 'year' },
                ]}
                value={orderPeriod}
                onChange={(next) => setOrderPeriod(next as OrderPeriod)}
                ariaLabel="Toggle order period"
                sx={{ minWidth: 0, width: 'auto' }}
              />
            </Stack>

            <Sparkline
              data={orderData.map((point) => ({ label: point.label, value: point.total }))}
              color={theme.palette.info.main}
              height={80}
              ariaLabel="Orders trend"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} md={12} lg={4}>
        <KpiCard
          title="Total Income"
          value={kpiMetrics.totalIncome.value}
          subtitle={kpiMetrics.totalIncome.subtitle}
          delta={{ value: kpiMetrics.totalIncome.delta, trend: 'up' }}
          icon={<TrendingUpRounded fontSize="small" />}
          variant="soft"
          color="info"
          footer={
            <Sparkline
              data={sparklineData.income}
              color={theme.palette.info.main}
              ariaLabel="Income trend"
            />
          }
        />
      </Grid>

      <Grid xs={12} lg={8}>
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: theme.shadows[3] }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" fontWeight={600}>
                  Total Growth
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sessions split between desktop and mobile
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <SegmentedControl
                  options={[
                    { label: 'Today', value: 'today' },
                    { label: 'Week', value: 'week' },
                    { label: 'Month', value: 'month' },
                  ]}
                  value={growthPeriod}
                  onChange={(next) => setGrowthPeriod(next as GrowthPeriod)}
                  ariaLabel="Select growth period"
                  sx={{ minWidth: 0, width: 'auto' }}
                />
                <Tooltip title="More options">
                  <IconButton aria-label="Open growth options" onClick={(event) => setMenuAnchor(event.currentTarget)}>
                    <MoreHorizRounded />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <GrowthChart period={growthPeriod} />

            <Stack direction="row" spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Desktop
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {growthSeries[growthPeriod][growthSeries[growthPeriod].length - 1].desktop}
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Mobile
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {growthSeries[growthPeriod][growthSeries[growthPeriod].length - 1].mobile}
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {growthSeries[growthPeriod][growthSeries[growthPeriod].length - 1].total}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} lg={4}>
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: theme.shadows[3] }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" fontWeight={600}>
                  Popular Stocks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on last 7 days performance
                </Typography>
              </Box>
              <Tooltip title="More options">
                <IconButton aria-label="Open stocks options" onClick={(event) => setMenuAnchor(event.currentTarget)}>
                  <MoreHorizRounded />
                </IconButton>
              </Tooltip>
            </Stack>
            <PopularList />
          </CardContent>
        </Card>
      </Grid>

      <CardActionMenu anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
    </Grid>
  );
};

export default DashboardPage;
