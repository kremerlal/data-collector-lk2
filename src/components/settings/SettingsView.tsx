import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function SettingsView() {
  return (
    <Box>
      <Typography variant="h4" component="h1" className="page-title" gutterBottom>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Configure Databricks workspace connection and Unity Catalog targets via environment
        variables (local <code>.env</code> or Databricks App <code>app.yaml</code>).
      </Typography>
      <Paper className="page-card" sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" gutterBottom>Environment variables</Typography>
        <Box component="ul" sx={{ pl: 2.5, color: 'text.secondary', fontSize: '0.9rem' }}>
          <li><code>DATABRICKS_SQL_WAREHOUSE_HTTP_PATH</code> — SQL warehouse HTTP path</li>
          <li><code>DATABRICKS_CATALOG</code> — Unity Catalog name</li>
          <li><code>DATABRICKS_SCHEMA</code> — Schema for data collector tables</li>
          <li><code>DATABRICKS_CONFIG_PROFILE</code> — CLI auth profile (local dev)</li>
        </Box>
      </Paper>
    </Box>
  );
}
