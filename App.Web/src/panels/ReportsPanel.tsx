import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Download, Image } from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

import { useAuth, useDataStore } from '@/store';
import { useI18n } from '@/i18n';
import { getReports, type ReportData } from '@/api/reportApi';

const COLORS = ['#5E35B1', '#00BFA6', '#0288D1', '#FF7043', '#8E24AA'];

const ReportsPanel = () => {
  const { t } = useI18n();
  const { can, currentUser } = useAuth();
  const { teams, projects, users } = useDataStore((state) => ({ teams: state.teams, projects: state.projects, users: state.users }));

  const [fromDate, setFromDate] = useState(dayjs().subtract(14, 'day'));
  const [toDate, setToDate] = useState(dayjs());
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [reports, setReports] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({ open: false, message: '', severity: 'info' });

  const accessibleTeams = useMemo(() => {
    if (currentUser.role === 'CEO') return teams;
    if (currentUser.role === 'MANAGER') {
      return teams.filter((team) => team.managerId === currentUser.id);
    }
    return teams.filter((team) => team.memberIds.includes(currentUser.id));
  }, [currentUser, teams]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReports({
        from: fromDate.startOf('day').toISOString(),
        to: toDate.endOf('day').toISOString(),
        teamIds: selectedTeams.length ? selectedTeams : undefined,
        projectIds: selectedProjects.length ? selectedProjects : undefined,
        roles: selectedRoles.length ? (selectedRoles as any) : undefined,
      });
      setReports(data);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedTeams, selectedProjects, selectedRoles]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const exportCsv = () => {
    if (!reports) return;
    const header = 'Team,Worked Hours,Expected Hours\n';
    const rows = reports.hoursByTeam.map((entry) => `${entry.teamName},${entry.workedHours},${entry.expectedHours}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports_${fromDate.format('YYYYMMDD')}_${toDate.format('YYYYMMDD')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: t('reports.exported'), severity: 'success' });
  };

  const downloadPng = () => {
    setSnackbar({ open: true, message: t('reports.downloaded'), severity: 'info' });
  };

  const kpiCards = useMemo(() => {
    if (!reports) return [];
    const { kpis } = reports;
    return [
      { label: t('reports.kpis.lateness'), value: `${kpis.latenessRate.toFixed(1)}%` },
      { label: t('reports.kpis.avgHours'), value: `${kpis.avgWeeklyHours.toFixed(1)}h` },
      { label: t('reports.kpis.overtime'), value: `${kpis.overtimeHours.toFixed(1)}h` },
      { label: t('reports.kpis.absenteeism'), value: `${kpis.absenteeismRate.toFixed(1)}%` },
      { label: t('reports.kpis.onTimeArrivals'), value: kpis.onTimeArrivals.toString() },
      { label: t('reports.kpis.badgeCompliance'), value: `${kpis.badgeCompliance.toFixed(1)}%` },
    ];
  }, [reports, t]);

  const allowedRoles = useMemo(() => ['CEO', 'MANAGER', 'USER'], []);

  const teamOptions = can('org.view_all') ? teams : accessibleTeams;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={6} md={3}>
                <DatePicker label={t('reports.filters.from')} value={fromDate} onChange={(value) => value && setFromDate(value)} />
              </Grid>
              <Grid xs={6} md={3}>
                <DatePicker label={t('reports.filters.to')} value={toDate} onChange={(value) => value && setToDate(value)} />
              </Grid>
              <Grid xs={12} md={6}>
                <Select
                  multiple
                  fullWidth
                  value={selectedTeams}
                  renderValue={(value) => (value.length ? value.length + t('reports.filters.teamsSelected') : t('reports.filters.allTeams'))}
                  onChange={(event) => setSelectedTeams(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value)}
                >
                  {teamOptions.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid xs={12} md={6}>
                <Select
                  multiple
                  fullWidth
                  value={selectedProjects}
                  renderValue={(value) => (value.length ? value.length + t('reports.filters.projectsSelected') : t('reports.filters.allProjects'))}
                  onChange={(event) => setSelectedProjects(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value)}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              {can('org.view_all') && (
                <Grid xs={12} md={6}>
                  <Select
                    multiple
                    fullWidth
                    value={selectedRoles}
                    renderValue={(value) => (value.length ? value.join(', ') : t('reports.filters.allRoles'))}
                    onChange={(event) => setSelectedRoles(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value)}
                  >
                    {allowedRoles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              )}
              <Grid xs={12} md={6}>
                <Stack direction="row" spacing={1}>
                  <Button startIcon={<Download />} variant="outlined" onClick={exportCsv} disabled={!reports || loading}>
                    {t('reports.exportCsv')}
                  </Button>
                  <Button startIcon={<Image />} variant="outlined" onClick={downloadPng} disabled={!reports}>
                    {t('reports.downloadPng')}
                  </Button>
                  <Button variant="contained" onClick={loadReports} disabled={loading}>
                    {t('actions.refresh')}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {kpiCards.map((card) => (
            <Grid xs={12} sm={6} md={4} lg={2} key={card.label}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h5">{card.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {reports && (
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('reports.charts.hoursByTeam')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={reports.hoursByTeam}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="teamName" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Bar dataKey="workedHours" fill="#5E35B1" name={t('reports.charts.worked')} />
                      <Bar dataKey="expectedHours" fill="#00BFA6" name={t('reports.charts.expected')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('reports.charts.lateTrend')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={reports.latenessTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="lateRate" stroke="#D32F2F" name={t('reports.charts.lateRate')} />
                      <Line type="monotone" dataKey="workedHours" stroke="#5E35B1" name={t('reports.charts.worked')} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('reports.charts.tasksDistribution')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={reports.taskStatusDistribution} dataKey="value" nameKey="status" outerRadius={100} label>
                        {reports.taskStatusDistribution.map((entry, index) => (
                          <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </LocalizationProvider>
  );
};

export default ReportsPanel;
