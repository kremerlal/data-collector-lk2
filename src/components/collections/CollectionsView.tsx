import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { useProjects } from '../../hooks/useProjects';
import CreateProjectWizard from './CreateProjectWizard';
import DataEntryUrl from '../common/DataEntryUrl';

export default function CollectionsView() {
  const { projects, loading, error, refresh } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" component="h1" className="page-title" gutterBottom>
            Collections
          </Typography>
          <Typography color="text.secondary">
            Define forms, manage access, and collect data into Unity Catalog.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New collection
        </Button>
      </Box>

      {error && (
        <Paper className="page-card" sx={{ p: 2, mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <TableContainer component={Paper} className="page-card">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Data entry URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Your role</TableCell>
              <TableCell>Storage</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={18} />
                    Loading collections…
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {!loading && projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  No collections yet. Create one to design a form and start collecting data.
                </TableCell>
              </TableRow>
            )}
            {projects.map((project) => (
              <TableRow key={project.project_id} hover>
                <TableCell>
                  <RouterLink to={`/collections/${project.project_id}`} style={{ fontWeight: 600 }}>
                    {project.name}
                  </RouterLink>
                  {project.description && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {project.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {project.status === 'published' ? (
                    <DataEntryUrl projectId={project.project_id} />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Publish first
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={project.status} color={project.status === 'published' ? 'success' : 'default'} />
                </TableCell>
                <TableCell>{project.role}</TableCell>
                <TableCell>{project.storage_type}</TableCell>
                <TableCell>
                  {project.updated_at
                    ? new Date(project.updated_at).toLocaleDateString()
                    : new Date(project.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateProjectWizard
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={refresh}
      />
    </Box>
  );
}
