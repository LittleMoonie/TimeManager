import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Avatar, Grid, Menu, MenuItem, Typography } from '@mui/material'

// Project imports
import MainCard from '@/components/cards/MainCard'
import SkeletonEarningCard from '@/components/cards/skeleton/EarningCard'

// Assets
import EarningIcon from '@/assets/images/icons/earning.svg'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined'
import FileCopyTwoToneIcon from '@mui/icons-material/FileCopyOutlined'
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfOutlined'
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveOutlined'

interface EarningCardProps {
  isLoading?: boolean
}

/**
 * Dashboard Earning Card Component
 * Converted from views/dashboard/Default/EarningCard.js
 */
function EarningCard({ isLoading = false }: EarningCardProps) {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  if (isLoading) {
    return <SkeletonEarningCard />
  }

  return (
    <MainCard
      border={false}
      sx={{
        backgroundColor: theme.palette.secondary.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          width: '210px',
          height: '210px',
          background: theme.palette.secondary[800],
          borderRadius: '50%',
          top: '-85px',
          right: '-95px',
          [theme.breakpoints.down('xs')]: {
            top: '-105px',
            right: '-140px'
          }
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          width: '210px',
          height: '210px',
          background: theme.palette.secondary[800],
          borderRadius: '50%',
          top: '-125px',
          right: '-15px',
          opacity: 0.5,
          [theme.breakpoints.down('xs')]: {
            top: '-155px',
            right: '-70px'
          }
        }
      }}
      contentSX={{ p: '20px !important' }}
    >
      <Grid container direction="column">
        <Grid item>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Avatar
                variant="rounded"
                sx={{
                  backgroundColor: theme.palette.secondary[800],
                  mt: 1,
                  width: 56,
                  height: 56
                }}
              >
                <img src={EarningIcon} alt="Earning" />
              </Avatar>
            </Grid>
            <Grid item>
              <Avatar
                variant="rounded"
                sx={{
                  backgroundColor: theme.palette.secondary.dark,
                  color: theme.palette.secondary[200],
                  zIndex: 1,
                  width: 34,
                  height: 34,
                  cursor: 'pointer'
                }}
                aria-controls="menu-earning-card"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <MoreHorizIcon fontSize="inherit" />
              </Avatar>
              <Menu
                id="menu-earning-card"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                variant="selectedMenu"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
              >
                <MenuItem onClick={handleClose}>
                  <GetAppTwoToneIcon fontSize="inherit" sx={{ mr: 1.75 }} />
                  Import Card
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <FileCopyTwoToneIcon fontSize="inherit" sx={{ mr: 1.75 }} />
                  Copy Data
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <PictureAsPdfTwoToneIcon fontSize="inherit" sx={{ mr: 1.75 }} />
                  Export
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <ArchiveTwoToneIcon fontSize="inherit" sx={{ mr: 1.75 }} />
                  Archive File
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <Typography
                sx={{
                  fontSize: '2.125rem',
                  fontWeight: 500,
                  mr: 1,
                  mt: 1.75,
                  mb: 0.75
                }}
              >
                $500.00
              </Typography>
            </Grid>
            <Grid item>
              <Avatar
                sx={{
                  cursor: 'pointer',
                  backgroundColor: theme.palette.secondary[200],
                  color: theme.palette.secondary.dark,
                  width: 16,
                  height: 16
                }}
              >
                <ArrowUpwardIcon 
                  fontSize="inherit" 
                  sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }} 
                />
              </Avatar>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item sx={{ mb: 1.25 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 500,
              color: theme.palette.secondary[200]
            }}
          >
            Total Earning
          </Typography>
        </Grid>
      </Grid>
    </MainCard>
  )
}

export default EarningCard

