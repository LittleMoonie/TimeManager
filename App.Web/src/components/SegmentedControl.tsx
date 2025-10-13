import { Tabs, Tab, Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

export type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  sx?: SxProps<Theme>;
};

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  sx,
}: SegmentedControlProps<T>) => {
  return (
    <Box
      sx={{
        borderRadius: 999,
        px: 0.5,
        py: 0.25,
        backgroundColor: (theme) => theme.palette.action.hover,
        minWidth: options.length * 72,
        ...sx,
      }}
    >
      <Tabs
        value={value}
        onChange={(_, next) => next && onChange(next as T)}
        aria-label={ariaLabel ?? 'Segmented control'}
        variant="standard"
        sx={{
          minHeight: 36,
          '& .MuiTabs-flexContainer': {
            gap: 0.5,
          },
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        }}
      >
        {options.map((option) => (
          <Tab
            key={option.value}
            disableRipple
            value={option.value}
            label={option.label}
            sx={{
              minHeight: 32,
              minWidth: 64,
              px: 2,
              borderRadius: 999,
              transition: 'background-color 120ms ease',
              '&.Mui-selected': {
                backgroundColor: (theme) => theme.palette.background.paper,
                boxShadow: (theme) => theme.shadows[1],
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default SegmentedControl;
