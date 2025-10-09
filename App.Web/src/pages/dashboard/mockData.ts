import type { SparklineDatum } from '@/components/Sparkline';

export type TimeSeriesPoint = {
  label: string;
  desktop: number;
  mobile: number;
  total: number;
};

export const kpiMetrics = {
  totalEarning: {
    value: '$559.25K',
    delta: '+2.56%',
    subtitle: 'Compared to last week',
  },
  totalOrder: {
    value: '78,250',
    delta: '+8.5%',
    subtitle: 'Orders this month',
  },
  totalIncome: {
    value: '$26,450',
    delta: '+2.1%',
    subtitle: 'Net income this week',
  },
};

export const orderSeries = {
  month: [
    { label: 'Week 1', total: 1820 },
    { label: 'Week 2', total: 2140 },
    { label: 'Week 3', total: 1980 },
    { label: 'Week 4', total: 2360 },
  ],
  year: [
    { label: 'Q1', total: 6120 },
    { label: 'Q2', total: 6890 },
    { label: 'Q3', total: 7340 },
    { label: 'Q4', total: 8020 },
  ],
};

export const growthSeries: Record<'today' | 'week' | 'month', TimeSeriesPoint[]> = {
  today: [
    { label: '09:00', desktop: 32, mobile: 18, total: 50 },
    { label: '11:00', desktop: 42, mobile: 24, total: 66 },
    { label: '13:00', desktop: 56, mobile: 30, total: 86 },
    { label: '15:00', desktop: 52, mobile: 28, total: 80 },
    { label: '17:00', desktop: 48, mobile: 26, total: 74 },
  ],
  week: [
    { label: 'Mon', desktop: 220, mobile: 140, total: 360 },
    { label: 'Tue', desktop: 248, mobile: 162, total: 410 },
    { label: 'Wed', desktop: 262, mobile: 176, total: 438 },
    { label: 'Thu', desktop: 256, mobile: 170, total: 426 },
    { label: 'Fri', desktop: 274, mobile: 184, total: 458 },
    { label: 'Sat', desktop: 210, mobile: 152, total: 362 },
    { label: 'Sun', desktop: 196, mobile: 138, total: 334 },
  ],
  month: [
    { label: 'Week 1', desktop: 920, mobile: 620, total: 1540 },
    { label: 'Week 2', desktop: 980, mobile: 680, total: 1660 },
    { label: 'Week 3', desktop: 1050, mobile: 720, total: 1770 },
    { label: 'Week 4', desktop: 1120, mobile: 760, total: 1880 },
  ],
};

export const sparklineData: Record<string, SparklineDatum[]> = {
  earnings: [
    { label: 'Mon', value: 420 },
    { label: 'Tue', value: 468 },
    { label: 'Wed', value: 510 },
    { label: 'Thu', value: 489 },
    { label: 'Fri', value: 545 },
    { label: 'Sat', value: 520 },
    { label: 'Sun', value: 550 },
  ],
  orders: [
    { label: 'Week 1', value: 1800 },
    { label: 'Week 2', value: 2150 },
    { label: 'Week 3', value: 1985 },
    { label: 'Week 4', value: 2340 },
  ],
  income: [
    { label: 'Mon', value: 560 },
    { label: 'Tue', value: 575 },
    { label: 'Wed', value: 592 },
    { label: 'Thu', value: 604 },
    { label: 'Fri', value: 616 },
  ],
};

export const popularInstruments = [
  {
    id: 'GGT',
    name: 'GoGoTime Labs',
    symbol: 'GGT',
    price: '$124.40',
    change: '+2.45%',
    positive: true,
    data: [
      { label: 'Mon', value: 108 },
      { label: 'Tue', value: 112 },
      { label: 'Wed', value: 117 },
      { label: 'Thu', value: 121 },
      { label: 'Fri', value: 124 },
    ],
  },
  {
    id: 'TIM',
    name: 'Timekeeper Intl',
    symbol: 'TIM',
    price: '$86.12',
    change: '+1.12%',
    positive: true,
    data: [
      { label: 'Mon', value: 74 },
      { label: 'Tue', value: 78 },
      { label: 'Wed', value: 79 },
      { label: 'Thu', value: 82 },
      { label: 'Fri', value: 86 },
    ],
  },
  {
    id: 'SLA',
    name: 'Slackline Group',
    symbol: 'SLA',
    price: '$42.88',
    change: '-0.52%',
    positive: false,
    data: [
      { label: 'Mon', value: 46 },
      { label: 'Tue', value: 44 },
      { label: 'Wed', value: 43 },
      { label: 'Thu', value: 41 },
      { label: 'Fri', value: 42 },
    ],
  },
  {
    id: 'WSH',
    name: 'Workflow Shares',
    symbol: 'WSH',
    price: '$68.20',
    change: '+3.24%',
    positive: true,
    data: [
      { label: 'Mon', value: 58 },
      { label: 'Tue', value: 60 },
      { label: 'Wed', value: 63 },
      { label: 'Thu', value: 65 },
      { label: 'Fri', value: 68 },
    ],
  },
];
