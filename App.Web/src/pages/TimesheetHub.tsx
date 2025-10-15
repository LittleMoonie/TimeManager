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
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMenu } from '../hooks/useMenu';
import { MenuCardDto, MenuCategoryDto } from '../lib/api';

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

const TimesheetHub: React.FC = () => {
  const { menu, isLoading, isError } = useMenu();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (menu?.categories && menu.categories.length > 0 && !selectedCategoryKey) {
      setSelectedCategoryKey(menu.categories[0].key);
    }
  }, [menu, selectedCategoryKey]);

  if (isLoading) {
    return <Typography>Loading menu...</Typography>;
  }

  if (isError || !menu || !menu.categories.length) {
    return <Typography color="error">Error loading menu or menu is empty.</Typography>;
  }

  const selectedCategory = menu.categories.find((category) => category.key === selectedCategoryKey);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Timesheet Hub
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column: Categories */}
        <Grid item xs={12} md={3}>
          {isMobile ? (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategoryKey || ''}
                label="Category"
                onChange={(e) => setSelectedCategoryKey(e.target.value as string)}
              >
                {menu.categories.map((category: MenuCategoryDto) => (
                  <MenuItem key={category.key} value={category.key}>
                    <ListItemIcon>{getIconComponent(category.icon, 'small')}</ListItemIcon>
                    <ListItemText primary={category.title} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: theme.shape.borderRadius,
                p: 2,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
                Categories
              </Typography>
              <List component="nav">
                {menu.categories.map((category: MenuCategoryDto) => (
                  <ListItem disablePadding key={category.key}>
                    <ListItemButton
                      selected={selectedCategoryKey === category.key}
                      onClick={() => setSelectedCategoryKey(category.key)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemIcon>{getIconComponent(category.icon, 'medium')}</ListItemIcon>
                      <ListItemText primary={category.title} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        {/* Right Column: Cards */}
        <Grid item xs={12} md={9}>
          {selectedCategory ? (
            <Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
                {selectedCategory.title}
              </Typography>
              <Grid container spacing={3}>
                {selectedCategory.cards.map((card: MenuCardDto) => (
                  <Grid item xs={12} sm={6} md={4} key={card.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[1],
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <CardActionArea onClick={() => navigate(card.route)} sx={{ flexGrow: 1 }}>
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
                          {/* Optional: Stat Chip - Placeholder */}
                          <Box sx={{ mt: 2 }}>
                            <Chip label="Pending: 3" size="small" color="info" />
                          </Box>{' '}
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

export default TimesheetHub;
