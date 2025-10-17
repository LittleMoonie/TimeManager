import {
  AssessmentRounded,
  DashboardRounded,
  PeopleAltRounded,
  TaskAltRounded,
  PersonRounded,
  GroupsRounded,
  AccountBalanceRounded,
  SettingsRounded,
  BarChartRounded,
  AccessTimeRounded,
  CalendarMonthRounded,
  GroupWorkRounded,
  AttachMoneyRounded,
  ReceiptRounded,
  AdminPanelSettingsRounded,
  MenuBookRounded,
  HistoryRounded,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useTheme,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useMenu } from '@/hooks/useMenu';
import { MenuCardDto, MenuCategoryDto } from '@/lib/api';

const getIconComponent = (
  iconName?: string,
  fontSize: 'small' | 'medium' | 'large' = 'large',
): React.ReactNode => {
  switch (iconName) {
    case 'DashboardRounded':
      return <DashboardRounded fontSize={fontSize} />;
    case 'AssessmentRounded':
      return <AssessmentRounded fontSize={fontSize} />;
    case 'PeopleAltRounded':
      return <PeopleAltRounded fontSize={fontSize} />;
    case 'TaskAltRounded':
      return <TaskAltRounded fontSize={fontSize} />;
    case 'PersonRounded':
      return <PersonRounded fontSize={fontSize} />;
    case 'GroupsRounded':
      return <GroupsRounded fontSize={fontSize} />;
    case 'AccountBalanceRounded':
      return <AccountBalanceRounded fontSize={fontSize} />;
    case 'SettingsRounded':
      return <SettingsRounded fontSize={fontSize} />;
    case 'BarChartRounded':
      return <BarChartRounded fontSize={fontSize} />;
    case 'AccessTimeRounded':
      return <AccessTimeRounded fontSize={fontSize} />;
    case 'CalendarMonthRounded':
      return <CalendarMonthRounded fontSize={fontSize} />;
    case 'GroupWorkRounded':
      return <GroupWorkRounded fontSize={fontSize} />;
    case 'AttachMoneyRounded':
      return <AttachMoneyRounded fontSize={fontSize} />;
    case 'ReceiptRounded':
      return <ReceiptRounded fontSize={fontSize} />;
    case 'AdminPanelSettingsRounded':
      return <AdminPanelSettingsRounded fontSize={fontSize} />;
    case 'MenuBookRounded':
      return <MenuBookRounded fontSize={fontSize} />;
    case 'HistoryRounded':
      return <HistoryRounded fontSize={fontSize} />;
    default:
      return <DashboardRounded fontSize={fontSize} />;
  }
};

const Hub = ({ categoryKey }: { categoryKey: string }) => {
  const { menu, isLoading, isError } = useMenu();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const userPermissions = useMemo(() => new Set(user?.permissions ?? []), [user]);

  const accessibleCategories = useMemo(() => {
    if (!menu) return [];

    return menu.categories
      .map((category: MenuCategoryDto) => {
        const cards = category.cards.filter((card: MenuCardDto) => {
          if (!card.isEnabled) return false;
          if (card.requiredPermission && !userPermissions.has(card.requiredPermission)) {
            return false;
          }
          return true;
        });

        if (cards.length === 0) {
          return null;
        }

        return { ...category, cards };
      })
      .filter(
        (category): category is MenuCategoryDto & { cards: MenuCardDto[] } => category !== null,
      )
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [menu, userPermissions]);

  const selectedCategory = accessibleCategories.find((category) => category?.key === categoryKey);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !menu) {
    return <Typography color="error">Error loading menu or menu is empty.</Typography>;
  }

  if (accessibleCategories.length === 0) {
    return <Typography color="text.secondary">No timesheet categories available.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          {selectedCategory ? (
            <Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
                {selectedCategory.title}
              </Typography>
              <Grid container spacing={3}>
                {selectedCategory.cards.map((card) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[1],
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => navigate(`/app${card.route}`)}
                        sx={{ flexGrow: 1 }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box
                              sx={{
                                mr: 1.5,
                                color: theme.palette.primary.main,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {getIconComponent(card.icon)}
                            </Box>
                            <Typography variant="h6" component="div">
                              {card.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {card.subtitle}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Chip label="Pending: 3" size="small" color="info" />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Select a category to view cards.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Hub;
