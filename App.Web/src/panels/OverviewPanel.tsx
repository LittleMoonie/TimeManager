import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccessAlarm,
  AccessTimeOutlined,
  TrendingUp,
  EventBusy,
  QueryStats,
  Refresh,
  Percent,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ResponsiveContainer, ComposedChart, Bar, Line, Tooltip as ChartTooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

import { useDataStore, useOrgStore } from '@/store';
import { computeKpis, summarizeEventsByDay } from '@/utils/kpi';
import { useI18n } from '@/i18n';

import type { ActivityItem } from '@/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const cardValueFormatter = (value: number, unit: 'percent' | 'hours' | 'count') => {
  if (unit === 'percent') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'hours') {
    return `${value.toFixed(1)}h`;
  }
  return value.toString();
};

const deltaFormatter = (delta: number, unit: 'percent' | 'hours' | 'count') => {
  if (unit === 'percent') {
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
  }
  if (unit === 'hours') {
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}h`;
  }
  return `${delta >= 0 ? '+' : ''}${delta}`;
};

const getInitials = (text: string) =>
  text
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const ActivityListItem = ({ item }: { item: ActivityItem }) => {
  const icon = item.type === 'badge' ? <AccessTimeOutlined fontSize="small" /> : <TrendingUp fontSize="small" />;
  return (
    <ListItem disableGutters>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', width: 36, height: 36 }}>{icon}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={item.message}
        secondary={dayjs(item.timestamp).format('MMM D, HH:mm')}
        primaryTypographyProps={{ variant: 'body2' }}
      />
    </ListItem>
  );
};

const OverviewPanel = () => {
  const { t } = useI18n();
  const { organization } = useOrgStore((state) => ({ organization: state.organization }));
  const { clockEvents, announcements, activity, users } = useDataStore((state) => ({
    clockEvents: state.clockEvents,
    announcements: state.announcements,
    activity: state.activity,
    users: state.users,
  }));
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const tz = organization?.settings.timezone ?? 'UTC';
  const today = useMemo(() => dayjs().tz(tz).startOf('day'), [tz]);

  const todayEvents = useMemo(
    () =>
      clockEvents.filter((event) => {
        const ts = dayjs(event.timestamp).tz(tz);
        return ts.isSame(today, 'day');
      }),
    [clockEvents, tz, today],
  );

  const yesterdayEvents = useMemo(() => {
    const yesterday = today.subtract(1, 'day');
    return clockEvents.filter((event) => dayjs(event.timestamp).tz(tz).isSame(yesterday, 'day'));
  }, [clockEvents, tz, today]);

  const currentWeekEvents = useMemo(() => {
    const weekStart = today.startOf('week');
    return clockEvents.filter((event) => {
      const ts = dayjs(event.timestamp).tz(tz);
      return ts.isSame(weekStart, 'day') || ts.isAfter(weekStart);
    });
  }, [clockEvents, tz, today]);

  const previousWeekEvents = useMemo(() => {
    const weekStart = today.startOf('week').subtract(7, 'day');
    const weekEnd = today.startOf('week').subtract(1, 'day');
    return clockEvents.filter((event) => {
      const ts = dayjs(event.timestamp).tz(tz);
      return (ts.isSame(weekStart, 'day') || ts.isAfter(weekStart)) && (ts.isSame(weekEnd, 'day') || ts.isBefore(weekEnd));
    });
  }, [clockEvents, tz, today]);

  const todayKpis = useMemo(() => (organization ? computeKpis(todayEvents, organization) : null), [organization, todayEvents]);
  const yesterdayKpis = useMemo(
    () => (organization ? computeKpis(yesterdayEvents, organization) : null),
    [organization, yesterdayEvents],
  );
  const weekKpis = useMemo(
    () => (organization ? computeKpis(currentWeekEvents, organization) : null),
    [organization, currentWeekEvents],
  );
  const prevWeekKpis = useMemo(
    () => (organization ? computeKpis(previousWeekEvents, organization) : null),
    [organization, previousWeekEvents],
  );

  const cardMetrics = useMemo(() => {
    if (!todayKpis || !weekKpis) return [];
    const cards = [
      {
        key: 'onTime',
        label: t('overview.cards.onTime'),
        icon: <Percent fontSize="small" />,
        value: todayKpis.onTimeRate,
        unit: 'percent' as const,
        delta: yesterdayKpis ? todayKpis.onTimeRate - yesterdayKpis.onTimeRate : 0,
      },
      {
        key: 'avgHours',
        label: t('overview.cards.avgHours'),
        icon: <AccessAlarm fontSize="small" />,
        value: weekKpis.avgHoursPerDay,
        unit: 'hours' as const,
        delta: prevWeekKpis ? weekKpis.avgHoursPerDay - prevWeekKpis.avgHoursPerDay : 0,
      },
      {
        key: 'late',
        label: t('overview.cards.late'),
        icon: <TrendingUp fontSize="small" />,
        value: todayKpis.lateCount,
        unit: 'count' as const,
        delta: yesterdayKpis ? todayKpis.lateCount - yesterdayKpis.lateCount : 0,
      },
      {
        key: 'absent',
        label: t('overview.cards.absences'),
        icon: <EventBusy fontSize="small" />,
        value: todayKpis.absences,
        unit: 'count' as const,
        delta: yesterdayKpis ? todayKpis.absences - yesterdayKpis.absences : 0,
      },
      {
        key: 'overtime',
        label: t('overview.cards.overtime'),
        icon: <QueryStats fontSize="small" />,
        value: weekKpis.overtimeHours,
        unit: 'hours' as const,
        delta: prevWeekKpis ? weekKpis.overtimeHours - prevWeekKpis.overtimeHours : 0,
      },
    ];
    return cards;
  }, [todayKpis, yesterdayKpis, weekKpis, prevWeekKpis, t]);

  const trendData = useMemo(() => {
    if (!organization) return [];
    const summaries = summarizeEventsByDay(clockEvents, organization);
    const summaryMap = new Map(summaries.map((entry) => [entry.date, entry] as const));
    const days: Array<{ date: string; worked: number; expected: number; lateRate: number }> = [];
    for (let i = 13; i >= 0; i -= 1) {
      const day = today.subtract(i, 'day');
      const key = day.format('YYYY-MM-DD');
      const summary = summaryMap.get(key);
      const expectedMinutes = isWeekendDay(day) ? 0 : organization.settings.workdayHours * 60 * users.length;
      const worked = summary ? summary.workedMinutes / 60 : 0;
      const expected = summary ? summary.expectedMinutes / 60 : expectedMinutes / 60;
      const lateRate = summary && summary.sessions > 0 ? (summary.lateCount / summary.sessions) * 100 : 0;
      days.push({
        date: day.format('MMM D'),
        worked: Number(worked.toFixed(2)),
        expected: Number(expected.toFixed(2)),
        lateRate: Number(lateRate.toFixed(1)),
      });
    }
    return days;
  }, [organization, clockEvents, today, users.length]);

  const visibleAnnouncements = useMemo(
    () => announcements.filter((announcement) => !dismissed.has(announcement.id)),
    [announcements, dismissed],
  );

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {cardMetrics.map((card) => (
          <Grid xs={12} sm={6} md={4} lg={2} key={card.key}>
            <Card aria-label={`${card.label} card`}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Chip icon={card.icon} size="small" label={card.label.split(' ')[0]} sx={{ backgroundColor: 'secondary.light' }} />
                  </Stack>
                  <Typography variant="h4">{cardValueFormatter(card.value, card.unit)}</Typography>
                  <Typography variant="caption" color={card.delta >= 0 ? 'success.main' : 'error.main'}>
                    {deltaFormatter(card.delta, card.unit)} {t('overview.cards.delta')}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'stretch', md: 'center' }}>
            <Box sx={{ flexBasis: { md: '60%' }, minHeight: 280 }}>
              <Typography variant="h6" gutterBottom>
                {t('overview.trend.title')}
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="var(--mui-palette-text-secondary)" />
                  <YAxis yAxisId="left" stroke="var(--mui-palette-text-secondary)" />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--mui-palette-text-secondary)" domain={[0, 100]} />
                  <ChartTooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="worked" name="Worked hours" fill="var(--mui-palette-primary-main)" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="left" dataKey="expected" name="Expected hours" fill="var(--mui-palette-secondary-main)" radius={[6, 6, 0, 0]} opacity={0.5} />
                  <Line yAxisId="right" type="monotone" dataKey="lateRate" name="Late %" stroke="var(--mui-palette-error-main)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
            <Box sx={{ flexBasis: { md: '40%' }, width: '100%' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">{t('overview.announcements.title')}</Typography>
                <Tooltip title={t('overview.announcements.refresh')}>
                  <IconButton size="small" aria-label={t('overview.announcements.refresh')}>
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack spacing={2}>
                {visibleAnnouncements.length === 0 && <Typography variant="body2">{t('overview.announcements.empty')}</Typography>}
                {visibleAnnouncements.map((announcement) => (
                  <Alert
                    key={announcement.id}
                    severity={announcement.severity ?? 'info'}
                    onClose={() => handleDismiss(announcement.id)}
                    variant="outlined"
                  >
                    <Typography variant="subtitle2" component="div">
                      {announcement.title}
                    </Typography>
                    <Typography variant="body2">{announcement.body}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(announcement.createdAt).tz(tz).fromNow()}
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flexBasis: { md: '50%' } }}>
              <Typography variant="h6" gutterBottom>
                {t('overview.activity.title')}
              </Typography>
              <List dense>
                {activity.slice(0, 8).map((item) => (
                  <ActivityListItem key={item.id} item={item} />
                ))}
              </List>
            </Box>
            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
            <Box sx={{ flexBasis: { md: '50%' } }}>
              <Typography variant="h6" gutterBottom>
                {t('overview.teamStatus.title')}
              </Typography>
              <List dense>
                {users.slice(0, 8).map((user) => {
                  const initials = getInitials(`${user.firstName} ${user.lastName}`);
                  const status = user.status === 'ACTIVE' ? 'success' : user.status === 'PENDING' ? 'warning' : 'default';
                  return (
                    <ListItem key={user.id} divider disableGutters secondaryAction={<Chip label={user.status} size="small" color={status === 'success' ? 'success' : status === 'warning' ? 'warning' : 'default'} />}> 
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>{initials}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`${user.firstName} ${user.lastName}`} secondary={user.email} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

const isWeekendDay = (date: dayjs.Dayjs) => {
  const day = date.day();
  return day === 0 || day === 6;
};

export default OverviewPanel;
