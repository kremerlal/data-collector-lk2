import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function HelpView() {
  return (
    <Box>
      <Typography variant="h4" component="h1" className="page-title" gutterBottom>
        Help
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Quick reference for local development and deployment.
      </Typography>

      <Paper className="page-card" sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Local development</Typography>
        <Box component="ol" sx={{ pl: 2.5, color: 'text.secondary', fontSize: '0.9rem' }}>
          <li>Copy <code>.env.example</code> to <code>.env</code> and fill in Databricks values</li>
          <li>Run <code>pip install -r requirements.txt</code> and <code>npm install</code></li>
          <li>Start with <code>npm run dev:all</code> — frontend on :5173, API on :8000</li>
        </Box>
      </Paper>

      <Paper className="page-card" sx={{ p: 2.5 }}>
        <Typography variant="h6" gutterBottom>Layout</Typography>
        <Typography variant="body2" color="text.secondary">
          This app uses the DHS Scorecard shell: navy sidebar and header bar with a
          toggleable light/dark content area. Sidebar and header colors stay consistent
          in both modes.
        </Typography>
      </Paper>
    </Box>
  );
}
