import { Typography, Card, CardContent, Box, Grid } from '@mui/material'

/**
 * Typography utility page
 * TODO: Migrate from views/utilities/Typography.js
 */
function TypographyPage() {
  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Typography
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h1" gutterBottom>Heading 1</Typography>
              <Typography variant="h2" gutterBottom>Heading 2</Typography>
              <Typography variant="h3" gutterBottom>Heading 3</Typography>
              <Typography variant="h4" gutterBottom>Heading 4</Typography>
              <Typography variant="h5" gutterBottom>Heading 5</Typography>
              <Typography variant="h6" gutterBottom>Heading 6</Typography>
              <Typography variant="body1" gutterBottom>
                Body 1 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Typography>
              <Typography variant="body2" gutterBottom>
                Body 2 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Subtitle 1 - Lorem ipsum dolor sit amet
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Subtitle 2 - Lorem ipsum dolor sit amet
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TypographyPage
