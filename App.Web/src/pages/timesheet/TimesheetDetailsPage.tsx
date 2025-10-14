import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, CheckCircle, Cancel, Send } from '@mui/icons-material';
import { Edit, Delete, CheckCircle, Cancel, Send, Add } from '@mui/icons-material';
import {
  TimesheetsService,
  TimesheetEntriesService,
  UpdateTimesheetDto,
  TimesheetEntryResponseDto,
} from '@/lib/api';
import TimesheetEntryFormModal from '@/components/timesheet/TimesheetEntryFormModal';

const updateTimesheetSchema = z
  .object({
    periodStart: z
      .string()
      .min(1, 'Start date is required')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    periodEnd: z
      .string()
      .min(1, 'End date is required')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    notes: z.string().optional(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: 'End date cannot be before start date',
    path: ['periodEnd'],
  });

type UpdateTimesheetFormInputs = z.infer<typeof updateTimesheetSchema>;

const TimesheetDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const {
    data: timesheet,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['timesheets', id],
    queryFn: () => TimesheetsService.getTimesheet({ id: id! }),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<UpdateTimesheetFormInputs>({
    resolver: zodResolver(updateTimesheetSchema),
    mode: 'onChange',
    values: {
      periodStart: timesheet?.periodStart || '',
      periodEnd: timesheet?.periodEnd || '',
      notes: timesheet?.notes || '',
    },
  });

  React.useEffect(() => {
    if (timesheet) {
      reset({
        periodStart: timesheet.periodStart,
        periodEnd: timesheet.periodEnd,
        notes: timesheet.notes,
      });
    }
  }, [timesheet, reset]);

  const updateTimesheetMutation = useMutation({
    mutationFn: (data: UpdateTimesheetDto) =>
      TimesheetsService.updateTimesheet({ id: id!, requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', id] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      console.error('Failed to update timesheet:', err);
    },
  });

  const submitTimesheetMutation = useMutation({
    mutationFn: () => TimesheetsService.submitTimesheet({ id: id! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', id] });
    },
    onError: (err: any) => {
      console.error('Failed to submit timesheet:', err);
    },
  });

  const approveTimesheetMutation = useMutation({
    mutationFn: () => TimesheetsService.approveTimesheet({ id: id! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', id] });
    },
    onError: (err: any) => {
      console.error('Failed to approve timesheet:', err);
    },
  });

  const rejectTimesheetMutation = useMutation({
    mutationFn: (reason: string) =>
      TimesheetsService.rejectTimesheet({ id: id!, requestBody: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', id] });
      setOpenRejectDialog(false);
      setRejectionReason('');
    },
    onError: (err: any) => {
      console.error('Failed to reject timesheet:', err);
    },
  });

  const onUpdateSubmit = async (data: UpdateTimesheetFormInputs) => {
    updateTimesheetMutation.mutate(data);
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      rejectTimesheetMutation.mutate(rejectionReason);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Timesheet Details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography>Error loading timesheet: {error.message}</Typography>
      </Alert>
    );
  }

  if (!timesheet) {
    return <Alert severity="warning">Timesheet not found.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Timesheet Details
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        {isEditing ? (
          <Box
            component="form"
            onSubmit={handleSubmit(onUpdateSubmit)}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <TextField
              label="Period Start Date (YYYY-MM-DD)"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('periodStart')}
              error={!!errors.periodStart}
              helperText={errors.periodStart?.message}
              fullWidth
              required
            />
            <TextField
              label="Period End Date (YYYY-MM-DD)"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('periodEnd')}
              error={!!errors.periodEnd}
              helperText={errors.periodEnd?.message}
              fullWidth
              required
            />
            <TextField
              label="Notes"
              multiline
              rows={4}
              {...register('notes')}
              error={!!errors.notes}
              helperText={errors.notes?.message}
              fullWidth
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={updateTimesheetMutation.isPending || !isValid}
                startIcon={
                  updateTimesheetMutation.isPending ? <CircularProgress size={20} /> : null
                }
              >
                {updateTimesheetMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={1}>
            <Typography variant="h6">
              Period: {timesheet.periodStart} to {timesheet.periodEnd}
            </Typography>
            <Typography>Status: {timesheet.status}</Typography>
            <Typography>Total Minutes: {timesheet.totalMinutes}</Typography>
            {timesheet.notes && <Typography>Notes: {timesheet.notes}</Typography>}
            <Button variant="outlined" startIcon={<Edit />} onClick={() => setIsEditing(true)}>
              Edit Timesheet Details
            </Button>
          </Stack>
        )}
      </Paper>

      <Stack direction="row" spacing={2} mb={3}>
        {timesheet.status === 'DRAFT' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<Send />}
            onClick={() => submitTimesheetMutation.mutate()}
            disabled={submitTimesheetMutation.isPending}
          >
            {submitTimesheetMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        )}
        {timesheet.status === 'SUBMITTED' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => approveTimesheetMutation.mutate()}
              disabled={approveTimesheetMutation.isPending}
            >
              {approveTimesheetMutation.isPending ? 'Approving...' : 'Approve Timesheet'}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setOpenRejectDialog(true)}
              disabled={rejectTimesheetMutation.isPending}
            >
              Reject Timesheet
            </Button>
          </>
        )}
      </Stack>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Timesheet Entries
      </Typography>
      {timesheet.entries && timesheet.entries.length > 0 ? (
        <List component={Paper} elevation={1}>
          {timesheet.entries.map((entry: TimesheetEntryResponseDto) => (
            <ListItem key={entry.id} divider>
              <ListItemText
                primary={`Day: ${entry.day} | Duration: ${entry.durationMin} min | Action: ${entry.actionCodeId}`}
                secondary={`Country: ${entry.country} | Mode: ${entry.workMode} | Note: ${entry.note || 'N/A'}`}
              />
              <IconButton edge="end" aria-label="edit">
                <Edit />
              </IconButton>
              <IconButton edge="end" aria-label="delete">
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">
          <Typography>No entries for this timesheet. Add some!</Typography>
        </Alert>
      )}

      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>Reject Timesheet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            variant="standard"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            disabled={!rejectionReason.trim() || rejectTimesheetMutation.isPending}
          >
            {rejectTimesheetMutation.isPending ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimesheetDetailsPage;
