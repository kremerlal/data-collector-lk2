import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useStatus } from '../../StatusProvider';

export default function StatusBar() {
  const { busy, message } = useStatus();

  if (!busy) return null;

  return (
    <Box
      className="app-status-bar"
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <LinearProgress />
      <Typography variant="caption" sx={{ display: 'block', px: 2, py: 0.5, color: 'text.secondary' }}>
        {message || 'Loading…'}
      </Typography>
    </Box>
  );
}
