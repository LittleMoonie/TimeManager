import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
  Alert,
  Typography,
  Box,
} from '@mui/material';
// ...
    onError: (err: Error) => {
      console.error('Failed to create timesheet entry:', err);
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: (dto: UpdateTimesheetEntryDto) =>
      TimesheetEntriesService.updateTimesheetEntry({ id: entry!.id, requestBody: dto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', timesheetId] });
      onClose();
    },
    onError: (err: Error) => {
      console.error('Failed to update timesheet entry:', err);
    },
  });

  const isSubmitting = createEntryMutation.isPending || updateEntryMutation.isPending;

  const onSubmit = async (data: TimesheetEntryFormInputs) => {
    if (entry) {
      updateEntryMutation.mutate(data);
    } else {
      createEntryMutation.mutate(data);
    }
  };

  if (isLoadingActionCodes) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{entry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}</DialogTitle>
        <DialogContent>
          <CircularProgress />
          <Typography>Loading action codes...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (actionCodesError) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{entry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}</DialogTitle>
        <DialogContent>
          <Alert severity="error">Error loading action codes: {actionCodesError.message}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{entry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ pt: 1 }}
        >
          {(createEntryMutation.isError || updateEntryMutation.isError) && (
            <Alert severity="error">
              {createEntryMutation.error?.message ||
                updateEntryMutation.error?.message ||
                'Failed to save timesheet entry'}
            </Alert>
          )}

          <FormControl fullWidth error={!!errors.actionCodeId}>
            <InputLabel id="action-code-label">Action Code</InputLabel>
            <Select
              labelId="action-code-label"
              id="actionCodeId"
              label="Action Code"
              {...register('actionCodeId')}
              defaultValue={entry?.actionCodeId || ''}
            >
              {actionCodes?.map((code) => (
                <MenuItem key={code.id} value={code.id}>
                  {code.name} ({code.code})
                </MenuItem>
              ))}
            </Select>
            {errors.actionCodeId && <FormHelperText>{errors.actionCodeId.message}</FormHelperText>}
          </FormControl>

          <TextField
            label="Day (YYYY-MM-DD)"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register('day')}
            error={!!errors.day}
            helperText={errors.day?.message}
            fullWidth
            required
          />

          <TextField
            label="Duration (minutes)"
            type="number"
            {...register('durationMin', { valueAsNumber: true })}
            error={!!errors.durationMin}
            helperText={errors.durationMin?.message}
            fullWidth
            required
          />

          <TextField
            label="Country (ISO 3166-1 alpha-2)"
            {...register('country')}
            error={!!errors.country}
            helperText={errors.country?.message}
            fullWidth
            required
          />

          <FormControl fullWidth error={!!errors.workMode}>
            <InputLabel id="work-mode-label">Work Mode</InputLabel>
            <Select
              labelId="work-mode-label"
              id="workMode"
              label="Work Mode"
              {...register('workMode')}
              defaultValue={entry?.workMode || WorkMode.OFFICE}
            >
              {Object.values(WorkMode).map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </MenuItem>
              ))}
            </Select>
            {errors.workMode && <FormHelperText>{errors.workMode.message}</FormHelperText>}
          </FormControl>

          <TextField
            label="Notes"
            multiline
            rows={3}
            {...register('note')}
            error={!!errors.note}
            helperText={errors.note?.message}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !isValid}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : entry ? 'Save Changes' : 'Add Entry'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimesheetEntryFormModal;
