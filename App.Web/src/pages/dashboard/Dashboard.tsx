import { useState } from 'react';
import Grid from '@mui/material/GridLegacy';
import {
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
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCard } from '@/components/KpiCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Sparkline } from '@/components/Sparkline';
import { growthSeries, popularInstruments, sparklineData } from './mockData';

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
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
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
          cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }}
          contentStyle={{
            borderRadius: 12,
            border: 'none',
            padding: '12px 16px',
            background: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.92 : 0.98),
            boxShadow: theme.shadows[3],
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Bar
          dataKey="total"
          name="Total"
          fill={theme.palette.primary.main}
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
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
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>('week');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Grid container spacing={2} columns={12}>
      <Grid xs={12} sm={6} md={3}>
        <KpiCard
          title="Total Earning"
          value="$500.00"
          subtitle="Total Earning"
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

      <Grid xs={12} sm={6} md={3}>
        <Card sx={{ 
          height: '100%', 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
          color: 'white',
          boxShadow: theme.shadows[2] 
        }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Order
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: '2rem', letterSpacing: '-0.015em', color: 'white' }}>
                    $961
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBagRounded fontSize="small" />
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Chip label="Month" variant="outlined" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                <Chip label="Year" variant="filled" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </Stack>

            {/* Sparkline chart area */}
            <Box sx={{ height: 60, display: 'flex', alignItems: 'center' }}>
              <svg width="100%" height="40" viewBox="0 0 300 40">
                <path
                  d="M0,35 Q75,10 150,20 T300,15"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <Card sx={{ 
          height: '100%', 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
          color: 'white',
          boxShadow: theme.shadows[2] 
        }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Income
                </Typography>
                <Typography variant="h2" sx={{ fontSize: '2rem', letterSpacing: '-0.015em', color: 'white' }}>
                  $203k
                </Typography>
              </Stack>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUpRounded fontSize="small" />
              </Box>
            </Stack>
            {/* Simple sparkline */}
            <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <svg width="100%" height="30" viewBox="0 0 200 30">
                <path
                  d="M0,25 L40,15 L80,20 L120,10 L160,18 L200,12"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <Card sx={{ 
          height: '100%', 
          borderRadius: 3, 
          backgroundColor: '#FFF3C4', 
          color: '#B7791F',
          boxShadow: theme.shadows[2] 
        }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.8 }}>
                  Total Income
                </Typography>
                <Typography variant="h2" sx={{ fontSize: '2rem', letterSpacing: '-0.015em', color: 'inherit' }}>
                  $203k
                </Typography>
              </Stack>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: alpha('#B7791F', 0.2),
                  color: '#B7791F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountBalanceWalletRounded fontSize="small" />
              </Box>
            </Stack>
            {/* Simple sparkline */}
            <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <svg width="100%" height="30" viewBox="0 0 200 30">
                <path
                  d="M0,25 L40,15 L80,20 L120,10 L160,18 L200,12"
                  stroke="#B7791F"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} lg={8}>
        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: theme.shadows[3] }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
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

            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" fontWeight={600} color="primary.main">
                  $2,324.00
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Growth
                </Typography>
              </Box>
              <SegmentedControl
                options={[
                  { label: 'Today', value: 'today' },
                ]}
                value="today"
                onChange={() => {}}
                ariaLabel="View mode"
                sx={{ minWidth: 0, width: 'auto' }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} lg={4}>
        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: theme.shadows[3] }}>
          <CardContent sx={{ p: 3 }}>
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
    </Box>
  );
};

export default DashboardPage;
