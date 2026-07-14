import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { apiGet } from '../../api/client';

interface HealthResponse {
  status: string;
  app: string;
}

export default function DashboardView() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<HealthResponse>('/api/health')
      .then(setHealth)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" className="page-title" gutterBottom>
        Welcome to Data Collector
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: '42rem' }}>
        A Databricks App for ingesting, validating, and managing enterprise data collections.
        Built on the DHS Scorecard layout with React, FastAPI, and Unity Catalog.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <CloudUploadIcon color="primary" />, title: 'Ingest', desc: 'Upload and stage source data' },
          { icon: <CheckCircleOutlineIcon color="primary" />, title: 'Validate', desc: 'Run quality checks and rules' },
          { icon: <StorageIcon color="primary" />, title: 'Publish', desc: 'Write to Unity Catalog tables' },
        ].map(({ icon, title, desc }) => (
          <Grid key={title} size={{ xs: 12, md: 4 }}>
            <Paper className="page-card" sx={{ p: 2.5, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {icon}
                <Typography variant="h6">{title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">{desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper className="page-card" sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          API status
        </Typography>
        {health && (
          <Typography variant="body2" color="text.secondary">
            {health.app}: <strong>{health.status}</strong>
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="error">
            Backend unreachable — start the API with <code>npm run dev:all</code> or{' '}
            <code>uvicorn backend.main:app --port 8000</code>. ({error})
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
