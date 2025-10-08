import { Typography, Card, CardContent, Box, Button } from '@mui/material'
import { IconBrandGithub, IconBook } from '@tabler/icons-react'
import Grid from '@mui/material/Grid'

/**
 * Sample page component
 * TODO: Migrate from views/sample-page/index.js
 */
function SamplePage() {
  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Sample Page
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome to Berry Dashboard
              </Typography>
              <Typography variant="body1" paragraph>
                This is a sample page to demonstrate the basic structure and styling
                of the Berry Dashboard components. You can use this as a starting point
                for building your own pages.
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Features:
              </Typography>
              <Typography component="ul" sx={{ pl: 2 }}>
                <Typography component="li">Modern React with TypeScript</Typography>
                <Typography component="li">Material-UI v5 components</Typography>
                <Typography component="li">Responsive grid layout</Typography>
                <Typography component="li">Customizable themes</Typography>
                <Typography component="li">File-based routing</Typography>
              </Typography>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<IconBook size={20} />}
                  onClick={() => window.open('https://mui.com/', '_blank')}
                >
                  Documentation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconBrandGithub size={20} />}
                  onClick={() => window.open('https://github.com/codedthemes/berry-free-react-admin-template', '_blank')}
                >
                  Source Code
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SamplePage
