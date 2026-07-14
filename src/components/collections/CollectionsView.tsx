import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function CollectionsView() {
  return (
    <Box>
      <Typography variant="h4" component="h1" className="page-title" gutterBottom>
        Collections
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Data collection pipelines will appear here. Connect to your Unity Catalog schema to
        list and manage collections.
      </Typography>
      <Paper className="page-card" sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No collections configured yet. Use Settings to connect your Databricks workspace.
        </Typography>
      </Paper>
    </Box>
  );
}
