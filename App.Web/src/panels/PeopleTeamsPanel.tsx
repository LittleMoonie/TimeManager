import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { GroupAdd, GroupRemove, PeopleAlt, Timeline } from '@mui/icons-material';

import { useAuth, useDataStore } from '@/store';
import { usePortalContext } from '@/portalContext';
import type { Team, User } from '@/types';
import { useI18n } from '@/i18n';
import { addUserToTeam, removeUserFromTeam } from '@/api/teamApi';

const PeopleTeamsPanel = () => {
  const { t } = useI18n();
  const { activeTeamId, setActiveTeamId } = usePortalContext();
  const { currentUser, can } = useAuth();
  const {
    users,
    teams,
    refreshUsers,
    refreshTeams,
  } = useDataStore((state) => ({
    users: state.users,
    teams: state.teams,
    refreshUsers: state.refreshUsers,
    refreshTeams: state.refreshTeams,
  }));

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [dialog, setDialog] = useState<{ team: Team | null; mode: 'add' | 'remove' } | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (search && !`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      if (teamFilter !== 'all' && user.teamId !== teamFilter) {
        return false;
      }
      return true;
    });
  }, [users, search, roleFilter, teamFilter]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('people.columns.name'),
      flex: 1.6,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
    },
    {
      field: 'email',
      headerName: t('people.columns.email'),
      flex: 1.6,
    },
    {
      field: 'role',
      headerName: t('people.columns.role'),
      flex: 1,
    },
    {
      field: 'teamId',
      headerName: t('people.columns.team'),
      flex: 1,
      valueGetter: (params) => teams.find((team) => team.id === params.value)?.name ?? t('people.noTeam'),
    },
    {
      field: 'status',
      headerName: t('people.columns.status'),
      flex: 1,
      renderCell: (params) => <Chip label={params.value} size="small" color={params.value === 'ACTIVE' ? 'success' : 'default'} />,
    },
  ];

  const manageTeams = async (team: Team, userId: string, mode: 'add' | 'remove') => {
    if (mode === 'add') {
      await addUserToTeam(team.id, userId);
    } else {
      await removeUserFromTeam(team.id, userId);
    }
    await Promise.all([refreshTeams(), refreshUsers()]);
  };

  const canManageTeam = (team: Team) => {
    if (!can('team.manage')) return false;
    if (currentUser.role === 'CEO') return true;
    return team.managerId === currentUser.id;
  };

  const openDialog = (team: Team, mode: 'add' | 'remove') => {
    setDialog({ team, mode });
    setSelectedMember('');
  };

  const membersForDialog = useMemo(() => {
    if (!dialog?.team) return [];
    if (dialog.mode === 'add') {
      return users.filter((user) => user.teamId !== dialog.team!.id);
    }
    return users.filter((user) => dialog.team!.memberIds.includes(user.id));
  }, [dialog, users]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={4}>
              <TextField
                label={t('people.filters.search')}
                fullWidth
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Grid>
            <Grid xs={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('people.filters.role')}</InputLabel>
                <Select value={roleFilter} label={t('people.filters.role')} onChange={(event) => setRoleFilter(event.target.value)}>
                  <MenuItem value="all">{t('people.filters.allRoles')}</MenuItem>
                  <MenuItem value="CEO">CEO</MenuItem>
                  <MenuItem value="MANAGER">Manager</MenuItem>
                  <MenuItem value="USER">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('people.filters.team')}</InputLabel>
                <Select value={teamFilter} label={t('people.filters.team')} onChange={(event) => setTeamFilter(event.target.value)}>
                  <MenuItem value="all">{t('people.filters.allTeams')}</MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={t('people.directoryTitle')} />
        <CardContent>
          <DataGrid
            autoHeight
            rows={filteredUsers}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {teams.map((team) => {
          const manager = users.find((user) => user.id === team.managerId);
          const canManage = canManageTeam(team);
          const memberCount = team.memberIds.length;
          return (
            <Grid xs={12} md={4} key={team.id}>
              <Card>
                <CardHeader title={team.name} subheader={manager ? `${manager.firstName} ${manager.lastName}` : t('people.noManager')} />
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1}>
                      <Chip icon={<PeopleAlt fontSize="small" />} label={t('people.headcount', { count: memberCount })} />
                      <Chip color="primary" label={activeTeamId === team.id ? t('people.activeTeam') : t('people.teamChip')} />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" startIcon={<Timeline />} onClick={() => setActiveTeamId(team.id)}>
                        {t('people.actions.viewTimesheet')}
                      </Button>
                      <Button variant="outlined" onClick={() => setActiveTeamId(team.id)}>
                        {t('people.actions.viewTasks')}
                      </Button>
                    </Stack>
                    {canManage && (
                      <Stack direction="row" spacing={1}>
                        <Button startIcon={<GroupAdd />} variant="contained" onClick={() => openDialog(team, 'add')}>
                          {t('people.actions.addMember')}
                        </Button>
                        <Button startIcon={<GroupRemove />} variant="outlined" onClick={() => openDialog(team, 'remove')}>
                          {t('people.actions.removeMember')}
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={dialog !== null} onClose={() => setDialog(null)}>
        <DialogTitle>
          {dialog?.mode === 'add' ? t('people.dialog.addTitle', { team: dialog.team?.name ?? '' }) : t('people.dialog.removeTitle', { team: dialog?.team?.name ?? '' })}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>{t('people.dialog.member')}</InputLabel>
            <Select value={selectedMember} label={t('people.dialog.member')} onChange={(event) => setSelectedMember(event.target.value)}>
              {membersForDialog.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>{t('people.dialog.cancel')}</Button>
          <Button
            onClick={async () => {
              if (!dialog?.team || !selectedMember) return;
              await manageTeams(dialog.team, selectedMember, dialog.mode);
              setDialog(null);
            }}
            variant="contained"
            disabled={!selectedMember}
          >
            {dialog?.mode === 'add' ? t('people.actions.addMember') : t('people.actions.removeMember')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PeopleTeamsPanel;
