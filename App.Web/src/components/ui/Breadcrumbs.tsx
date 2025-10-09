import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Home } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const AppBreadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <Box
      sx={{
        mt: 1.5,
        mb: 3,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Breadcrumbs
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
            fontSize: '0.875rem',
          },
          '& .MuiBreadcrumbs-li': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {items.map((item, index) => (
          <Box key={index} display="flex" alignItems="center">
            {index === 0 && item.href ? (
              <Link 
                component={RouterLink} 
                to={item.href} 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                <Home sx={{ fontSize: '1rem', mr: 0.5 }} />
                {item.label}
              </Link>
            ) : item.href ? (
              <Link 
                component={RouterLink} 
                to={item.href}
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                {item.label}
              </Link>
            ) : (
              <Typography 
                color="text.primary" 
                sx={{ fontSize: '0.875rem' }}
              >
                {item.label}
              </Typography>
            )}
          </Box>
        ))}
      </Breadcrumbs>
    </Box>
  );
};
