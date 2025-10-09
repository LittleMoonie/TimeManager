import { useId } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer, Tooltip, type TooltipProps } from 'recharts';

export type SparklineDatum = {
  label: string;
  value: number;
};

type SparklineProps = {
  data: SparklineDatum[];
  color?: string;
  height?: number;
  ariaLabel?: string;
};

const SparklineTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <Box
      component="span"
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 1,
        typography: 'caption',
        color: 'common.white',
        backgroundColor: alpha(item.color ?? theme.palette.primary.main, 0.96),
      }}
    >
      {item.value}
    </Box>
  );
};

export const Sparkline = ({ data, color, height = 48, ariaLabel }: SparklineProps) => {
  const theme = useTheme();
  const stroke = color ?? theme.palette.primary.main;
  const gradientId = useId();

  return (
    <Box sx={{ width: '100%', height }} aria-label={ariaLabel} role="img">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`sparkline-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={alpha(stroke, 0.32)} />
              <stop offset="100%" stopColor={alpha(stroke, 0.05)} />
            </linearGradient>
          </defs>
          {/* Fake axes to control padding */}
          <Tooltip cursor={{ strokeDasharray: '4 4' }} content={<SparklineTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#sparkline-${gradientId})`}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default Sparkline;
