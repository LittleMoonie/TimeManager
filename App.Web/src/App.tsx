import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import {
  AccessTimeOutlined,
  DarkModeOutlined,
  DensityMedium,
  DensitySmall,
  GroupsOutlined,
  InsightsOutlined,
  LightModeOutlined,
  Logout,
  ManageAccounts,
  PersonOutline,
  ScheduleOutlined,
  Search,
  SettingsOutlined,
  TaskAltOutlined,
  Translate,
  WorkOutlineOutlined,
  DashboardOutlined,
} from '@mui/icons-material';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { buildTheme } from './theme';
import { I18nProvider, locales, useI18n } from './i18n';
import { PortalContext } from './portalContext';
import {
  orderedRoles,
  useAuth,
  useDataStore,
  useOrgStore,
  usePreferencesStore,
} from './store';
import type { PermissionKey } from './types';
import {
  AdminPanel,
  BadgePanel,
  OverviewPanel,
  PeopleTeamsPanel,
  ProjectsPanel,
  ReportsPanel,
  TasksPanel,
  TimesheetPanel,
} from './panels';

const panels = {
  overview: OverviewPanel,
  badge: BadgePanel,
  timesheet: TimesheetPanel,
  tasks: TasksPanel,
  people: PeopleTeamsPanel,
  projects: ProjectsPanel,
  reports: ReportsPanel,
  admin: AdminPanel,
};

type PanelKey = keyof typeof panels;

interface AppTab {
  key: PanelKey;
  labelKey: string;
  icon: React.ReactElement;
  permission?: PermissionKey;
}

const TAB_CONFIG: AppTab[] = [
  { key: 'overview', labelKey: 'tabs.overview', icon: <DashboardOutlined fontSize="small" /> },
  { key: 'badge', labelKey: 'tabs.badge', icon: <AccessTimeOutlined fontSize="small" />, permission: 'time.badge' },
  { key: 'timesheet', labelKey: 'tabs.timesheet', icon: <ScheduleOutlined fontSize="small" /> },
  { key: 'tasks', labelKey: 'tabs.tasks', icon: <TaskAltOutlined fontSize="small" /> },
  { key: 'people', labelKey: 'tabs.people', icon: <GroupsOutlined fontSize="small" />, permission: 'user.read' },
  { key: 'projects', labelKey: 'tabs.projects', icon: <WorkOutlineOutlined fontSize="small" />, permission: 'team.view_all' },
  { key: 'reports', labelKey: 'tabs.reports', icon: <InsightsOutlined fontSize="small" />, permission: 'org.view_all' },
  { key: 'admin', labelKey: 'tabs.admin', icon: <SettingsOutlined fontSize="small" />, permission: 'admin.manage' },
];

const MODE_ICONS = {
  light: <LightModeOutlined fontSize="small" />,
  dark: <DarkModeOutlined fontSize="small" />,
};

const AppShell = () => {
  const { t } = useI18n();
  const { currentUser, signInAs, can } = useAuth();
  const { loadInitialData, initialized, loading, teams } = useDataStore((state) => ({
    loadInitialData: state.loadInitialData,
    initialized: state.initialized,
    loading: state.loading,
    teams: state.teams,
  }));
  const orgLoading = useOrgStore((state) => state.loading);
  const loadOrg = useOrgStore((state) => state.load);

  const [activeTab, setActiveTab] = useState<PanelKey>('overview');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<'all' | string>('all');

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const { mode, density, toggleMode, toggleDensity, locale, setLocale } = usePreferencesStore((state) => ({
    mode: state.mode,
    density: state.density,
    toggleMode: state.toggleMode,
    toggleDensity: state.toggleDensity,
    locale: state.locale,
    setLocale: state.setLocale,
  }));
  const effectiveMode = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
  const theme = useMemo(() => buildTheme(effectiveMode, density), [effectiveMode, density]);

  useEffect(() => {
    if (!initialized) {
      loadInitialData().catch((error) => console.error('Failed to load data', error));
    }
  }, [initialized, loadInitialData]);

  useEffect(() => {
    loadOrg().catch((error) => console.error('Failed to load organization', error));
  }, [loadOrg]);

  useEffect(() => {
    if ((currentUser.role === 'MANAGER' || currentUser.role === 'USER') && currentUser.teamId) {
      setTeamFilter(currentUser.teamId);
    } else {
      setTeamFilter('all');
    }
  }, [currentUser.id, currentUser.role, currentUser.teamId]);

  const availableTabs = useMemo(
    () =>
      TAB_CONFIG.filter((tab) => !tab.permission || can(tab.permission)).map((tab) => ({
        ...tab,
        label: t(tab.labelKey),
      })),
    [can, t],
  );

  useEffect(() => {
    if (!availableTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(availableTabs[0]?.key ?? 'overview');
    }
  }, [availableTabs, activeTab]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleRoleChange = (role: (typeof orderedRoles)[number]) => {
    signInAs(role);
    handleProfileMenuClose();
  };

  const handleLocaleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLocale(event.target.value as typeof locale);
  };

  const teamOptions = useMemo(() => {
    if (!teams.length) return [] as Array<{ value: string; label: string }>; 
    if (can('team.view_all')) {
      return [
        { value: 'all', label: 'All teams' },
        ...teams.map((team) => ({ value: team.id, label: team.name })),
      ];
    }
    if (currentUser.teamId) {
      const team = teams.find((item) => item.id === currentUser.teamId);
      return team ? [{ value: team.id, label: team.name }] : [];
    }
    return [];
  }, [teams, can, currentUser.teamId]);

  const TabComponent = panels[activeTab] ?? OverviewPanel;

  return (
    <PortalContext.Provider
      value={{
        activeTeamId: teamFilter,
        setActiveTeamId: setTeamFilter,
        searchTerm,
        setSearchTerm,
      }}
    >
      <Box display="flex" minHeight="100vh" sx={{ backgroundColor: theme.palette.background.default }}>
        <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">{t('app.title')}</Typography>
              <Chip label={currentUser.role} size="small" color="secondary" />
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }} aria-label="Team switcher">
                <Select
                  value={teamFilter}
                  onChange={(event) => setTeamFilter(event.target.value as 'all' | string)}
                  disabled={!can('team.view_all') && teamOptions.length <= 1}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Select team' }}
                >
                  {teamOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <OutlinedInput
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                size="small"
                sx={{ maxWidth: 320 }}
                inputProps={{ 'aria-label': 'Global search' }}
                startAdornment={
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                }
              />
            </Box>
            <Tooltip title={t('actions.toggleTheme')}>
              <IconButton onClick={toggleMode} aria-label="Toggle color mode" color="inherit">
                {MODE_ICONS[effectiveMode]}
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle density">
              <IconButton onClick={toggleDensity} aria-label="Toggle table density" color="inherit">
                {density === 'compact' ? <DensityMedium fontSize="small" /> : <DensitySmall fontSize="small" />}
              </IconButton>
            </Tooltip>
            <FormControl size="small" aria-label="Locale selector">
              <Select value={locale} onChange={handleLocaleChange} startAdornment={<Translate fontSize="small" sx={{ mr: 1 }} />}>
                {locales.map((entry) => (
                  <MenuItem key={entry.key} value={entry.key}>
                    {entry.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title={currentUser.email}>
              <IconButton aria-label="Profile menu" onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose} keepMounted>
              <Box px={2} py={1}>
                <Typography variant="subtitle2">{currentUser.firstName} {currentUser.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser.email}
                </Typography>
              </Box>
              <Divider />
              {orderedRoles.map((role) => (
                <MenuItem key={role} selected={role === currentUser.role} onClick={() => handleRoleChange(role)}>
                  <ListItemIconWrapper>
                    <ManageAccounts fontSize="small" />
                  </ListItemIconWrapper>
                  <Typography>{role}</Typography>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem onClick={toggleDensity}>
                <ListItemIconWrapper>
                  {density === 'compact' ? <DensityMedium fontSize="small" /> : <DensitySmall fontSize="small" />}
                </ListItemIconWrapper>
                <Typography>Toggle density</Typography>
              </MenuItem>
              <MenuItem onClick={toggleMode}>
                <ListItemIconWrapper>{MODE_ICONS[effectiveMode]}</ListItemIconWrapper>
                <Typography>Toggle theme</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIconWrapper>
                  <Logout fontSize="small" />
                </ListItemIconWrapper>
                <Typography>Sign out</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
          {(loading || orgLoading) && <LinearProgress color="secondary" />}
        </AppBar>
        <Toolbar />
        <Box component="nav" role="navigation" aria-label="Section navigation" sx={{ width: 240, borderRight: `1px solid ${theme.palette.divider}`, position: 'sticky', top: 64, height: 'calc(100vh - 64px)', backgroundColor: theme.palette.background.paper }}>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            aria-label="Portal sections"
            sx={{ mt: 2 }}
            variant="scrollable"
          >
            {availableTabs.map((tab) => (
              <Tab
                key={tab.key}
                value={tab.key}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                aria-controls={`${tab.key}-panel`}
                id={`${tab.key}-tab`}
                sx={{ alignItems: 'flex-start' }}
              />
            ))}
          </Tabs>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          {!initialized ? (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <Box id={`${activeTab}-panel`} role="tabpanel" aria-labelledby={`${activeTab}-tab`}>
              <TabComponent />
            </Box>
          )}
        </Box>
      </Box>
    </PortalContext.Provider>
  );
};

const ListItemIconWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box component="span" sx={{ display: 'inline-flex', minWidth: 32 }}>
    {children}
  </Box>
);

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <I18nProvider>
        <ThemeBridge />
      </I18nProvider>
    </StyledEngineProvider>
  );
};

const ThemeBridge = () => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const { mode, density } = usePreferencesStore((state) => ({ mode: state.mode, density: state.density }));
  const effectiveMode = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
  const theme = useMemo(() => buildTheme(effectiveMode, density), [effectiveMode, density]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell />
    </ThemeProvider>
  );
};

export default App;
