import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Add, ContentCopy, Refresh } from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useAuth, useOrgStore } from '@/store';
import { useI18n } from '@/i18n';
import {
  createApiKey,
  getOrganization,
  listAccessLogs,
  listApiKeys,
  listAuditLogs,
  listWebhooks,
  rolePermissionMatrix,
  toggleWebhook,
  revokeApiKey,
} from '@/api/adminApi';

import type { AccessLog, ApiKey, AuditLog, Webhook } from '@/types';

dayjs.extend(relativeTime);

const AdminPanel = () => {
  const { t } = useI18n();
  const { can } = useAuth();
  const { organization, updateSettings, load } = useOrgStore((state) => ({
    organization: state.organization,
    updateSettings: state.updateSettings,
    load: state.load,
  }));

  const [orgSettings, setOrgSettings] = useState({ workdayHours: 8, latenessGraceMins: 5, timezone: 'UTC', holidays: '' });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!organization) return;
    setOrgSettings({
      workdayHours: organization.settings.workdayHours,
      latenessGraceMins: organization.settings.latenessGraceMins,
      timezone: organization.settings.timezone,
      holidays: organization.settings.holidays.join(', '),
    });
  }, [organization]);

  const refreshAdminData = async () => {
    const [org, keys, hooks, audits, access] = await Promise.all([
      getOrganization(),
      listApiKeys(),
      listWebhooks(),
      listAuditLogs(),
      listAccessLogs(),
    ]);
    setApiKeys(keys);
    setWebhooks(hooks);
    setAuditLogs(audits);
    setAccessLogs(access);
    setOrgSettings({
      workdayHours: org.settings.workdayHours,
      latenessGraceMins: org.settings.latenessGraceMins,
      timezone: org.settings.timezone,
      holidays: org.settings.holidays.join(', '),
    });
  };

  useEffect(() => {
    void refreshAdminData();
  }, []);

  const handleSettingsSave = async () => {
    await updateSettings({
      workdayHours: Number(orgSettings.workdayHours),
      latenessGraceMins: Number(orgSettings.latenessGraceMins),
      timezone: orgSettings.timezone,
      holidays: orgSettings.holidays.split(',').map((day) => day.trim()).filter(Boolean),
    });
    setSnackbar({ open: true, message: t('admin.settingsSaved'), severity: 'success' });
    await refreshAdminData();
  };

  const handleCreateKey = async () => {
    const key = await createApiKey(`Key ${dayjs().format('HH:mm:ss')}`);
    await refreshAdminData();
    navigator.clipboard.writeText(key.id).catch(() => undefined);
    setSnackbar({ open: true, message: t('admin.apiKeyCreated'), severity: 'success' });
  };

  const handleRevokeKey = async (id: string) => {
    await revokeApiKey(id);
    await refreshAdminData();
    setSnackbar({ open: true, message: t('admin.apiKeyRevoked'), severity: 'info' });
  };

  const handleToggleWebhook = async (id: string, enabled: boolean) => {
    await toggleWebhook(id, enabled);
    await refreshAdminData();
  };

  const permissionRows = useMemo(() => {
    return Object.entries(rolePermissionMatrix).map(([role, permissions]) => ({ role, permissions }));
  }, []);

  const auditColumns: GridColDef[] = [
    { field: 'action', headerName: t('admin.audit.action'), flex: 1 },
    { field: 'targetTable', headerName: t('admin.audit.target'), flex: 1 },
    {
      field: 'createdAt',
      headerName: t('admin.audit.timestamp'),
      flex: 1,
      valueFormatter: ({ value }) => dayjs(value as string).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const accessColumns: GridColDef[] = [
    { field: 'method', headerName: t('admin.access.method'), flex: 0.5 },
    { field: 'endpoint', headerName: t('admin.access.endpoint'), flex: 1.2 },
    { field: 'statusCode', headerName: t('admin.access.status'), flex: 0.5 },
    {
      field: 'timestamp',
      headerName: t('admin.access.timestamp'),
      flex: 1,
      valueFormatter: ({ value }) => dayjs(value as string).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title={t('admin.settingsTitle')}
          action={
            <IconButton onClick={refreshAdminData} aria-label={t('actions.refresh')}>
              <Refresh />
            </IconButton>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} md={3}>
              <TextField
                type="number"
                label={t('admin.fields.workdayHours')}
                fullWidth
                value={orgSettings.workdayHours}
                onChange={(event) => setOrgSettings((prev) => ({ ...prev, workdayHours: Number(event.target.value) }))}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                type="number"
                label={t('admin.fields.graceMins')}
                fullWidth
                value={orgSettings.latenessGraceMins}
                onChange={(event) => setOrgSettings((prev) => ({ ...prev, latenessGraceMins: Number(event.target.value) }))}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                label={t('admin.fields.timezone')}
                fullWidth
                value={orgSettings.timezone}
                onChange={(event) => setOrgSettings((prev) => ({ ...prev, timezone: event.target.value }))}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                label={t('admin.fields.holidays')}
                fullWidth
                value={orgSettings.holidays}
                onChange={(event) => setOrgSettings((prev) => ({ ...prev, holidays: event.target.value }))}
                helperText={t('admin.fields.holidaysHelper')}
              />
            </Grid>
          </Grid>
          <Box mt={2}>
            <Button variant="contained" onClick={handleSettingsSave}>
              {t('admin.saveSettings')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={t('admin.rbacTitle')} />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.rbac.role')}</TableCell>
                <TableCell>{t('admin.rbac.permissions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissionRows.map((row) => (
                <TableRow key={row.role}>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {row.permissions.map((perm) => (
                        <Chip key={perm} label={perm} color="secondary" size="small" />
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card>
            <CardHeader
              title={t('admin.apiKeys.title')}
              action={
                <Button startIcon={<Add />} variant="contained" onClick={handleCreateKey}>
                  {t('admin.apiKeys.create')}
                </Button>
              }
            />
            <CardContent>
              {apiKeys.map((key) => (
                <Stack key={key.id} direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="subtitle2">{key.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('admin.apiKeys.lastUsed', { date: key.lastUsedAt ? dayjs(key.lastUsedAt).fromNow() : t('admin.apiKeys.never') })}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={key.active ? t('admin.apiKeys.active') : t('admin.apiKeys.revoked')} color={key.active ? 'success' : 'default'} size="small" />
                    <Button size="small" onClick={() => navigator.clipboard.writeText(key.id).catch(() => undefined)} startIcon={<ContentCopy fontSize="small" />}>
                      {t('admin.apiKeys.copy')}
                    </Button>
                    {key.active && (
                      <Button size="small" color="error" onClick={() => handleRevokeKey(key.id)}>
                        {t('admin.apiKeys.revoke')}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card>
            <CardHeader title={t('admin.webhooks.title')} />
            <CardContent>
              {webhooks.map((webhook) => (
                <Stack key={webhook.id} direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="subtitle2">{webhook.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {webhook.url}
                    </Typography>
                  </Box>
                  <Switch checked={webhook.enabled} onChange={(_, checked) => handleToggleWebhook(webhook.id, checked)} />
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card>
            <CardHeader title={t('admin.audit.title')} />
            <CardContent>
              <DataGrid autoHeight rows={auditLogs} columns={auditColumns} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card>
            <CardHeader title={t('admin.access.title')} />
            <CardContent>
              <DataGrid autoHeight rows={accessLogs} columns={accessColumns} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader title={t('admin.privacy.title')} />
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="outlined" onClick={() => setSnackbar({ open: true, message: t('admin.privacy.exportRequested'), severity: 'info' })}>
              {t('admin.privacy.requestExport')}
            </Button>
            <Button variant="contained" color="error" onClick={() => setSnackbar({ open: true, message: t('admin.privacy.anonymizeRequested'), severity: 'info' })}>
              {t('admin.privacy.requestAnonymize')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Stack>
  );
};

export default AdminPanel;
