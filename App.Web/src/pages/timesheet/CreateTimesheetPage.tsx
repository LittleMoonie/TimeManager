import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { TimesheetsService } from '@/lib/api';

const createTimesheetSchema = z
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

type CreateTimesheetFormInputs = z.infer<typeof createTimesheetSchema>;

const CreateTimesheetPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateTimesheetFormInputs>({
    resolver: zodResolver(createTimesheetSchema),
    mode: 'onChange',
  });

  const createTimesheetMutation = useMutation({
    mutationFn: TimesheetsService.createTimesheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      navigate('/timesheet');
    },
    onError: (err: Error) => {
      console.error('Failed to create timesheet:', err);
      // Optionally, set a form error or show a global alert
    },
  });

  const onSubmit = async (data: CreateTimesheetFormInputs) => {
    createTimesheetMutation.mutate({ requestBody: data });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Timesheet
      </Typography>
      <Paper elevation={1} sx={{ p: 3, maxWidth: 600 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          {createTimesheetMutation.isError && (
            <Alert severity="error">
              Failed to create timesheet:{' '}
              {createTimesheetMutation.error?.message || 'Unknown error'}
            </Alert>
          )}

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
            <Button variant="outlined" onClick={() => navigate('/timesheet')}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createTimesheetMutation.isPending || !isValid}
              startIcon={createTimesheetMutation.isPending ? <CircularProgress size={20} /> : null}
            >
              {createTimesheetMutation.isPending ? 'Creating...' : 'Create Timesheet'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateTimesheetPage;
