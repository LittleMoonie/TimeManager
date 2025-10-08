import { Card, CardContent, Chip, Stack, Typography, alpha, Box, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export type KpiVariant = 'gradient' | 'soft' | 'outlined';

export type KpiCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  delta?: {
    value: string;
    trend: 'up' | 'down';
  };
  icon?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: KpiVariant;
  color?: 'primary' | 'secondary' | 'info';
};

export const KpiCard = ({
  title,
  value,
  subtitle,
  delta,
  icon,
  action,
  footer,
  variant = 'gradient',
  color = 'primary',
}: KpiCardProps) => {
  const theme = useTheme();
  const palette = theme.palette[color];
  const gradientBackground = `linear-gradient(135deg, ${alpha(palette.light ?? palette.main, 0.95)} 0%, ${palette.dark ?? palette.main} 100%)`;
  const isGradient = variant === 'gradient';
  const isSoft = variant === 'soft';

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        color: isGradient ? palette.contrastText : 'inherit',
        background: isGradient
          ? gradientBackground
          : isSoft
          ? alpha(palette.main, 0.08)
          : theme.palette.background.paper,
        boxShadow: isGradient ? '0px 20px 45px rgba(94, 53, 177, 0.25)' : theme.shadows[2],
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.75}>
            <Typography variant="caption" sx={{ opacity: isGradient ? 0.88 : 1 }}>
              {title}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: '2.25rem',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: isGradient ? 0.8 : 0.7 }}>
                {subtitle}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {delta && (
              <Chip
                label={delta.value}
                color={delta.trend === 'up' ? 'success' : 'error'}
                size="small"
                sx={{
                  bgcolor: isGradient
                    ? alpha(delta.trend === 'up' ? theme.palette.success.main : theme.palette.error.main, 0.2)
                    : undefined,
                  color: isGradient ? palette.contrastText : undefined,
                }}
              />
            )}
            {icon && (
              <Avatar
                variant="rounded"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: isGradient ? alpha(palette.contrastText, 0.2) : alpha(palette.main, 0.16),
                  color: isGradient ? palette.contrastText : palette.main,
                }}
              >
                {icon}
              </Avatar>
            )}
            {action}
          </Stack>
        </Stack>

        {footer && <Box>{footer}</Box>}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
