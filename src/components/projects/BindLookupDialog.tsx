import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api } from '../../api/client';
import type { LookupColumn, ProjectDetail } from '../../types';
import BusyButton from '../common/BusyButton';

interface BindLookupDialogProps {
  open: boolean;
  project: ProjectDetail;
  onClose: () => void;
  onBound: () => void;
}

export default function BindLookupDialog({ open, project, onClose, onBound }: BindLookupDialogProps) {
  const [name, setName] = useState('');
  const [catalog, setCatalog] = useState('');
  const [schema, setSchema] = useState('');
  const [table, setTable] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [binding, setBinding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<LookupColumn[]>([]);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [sampleRows, setSampleRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!open) return;
    setName('');
    setCatalog('');
    setSchema('');
    setTable('');
    setError(null);
    setColumns([]);
    setRowCount(null);
    setSampleRows([]);
    void api.getConfig().then((cfg) => {
      setCatalog(cfg.default_data_catalog);
      setSchema(cfg.default_data_schema);
    });
  }, [open]);

  const preview = async () => {
    if (!catalog.trim() || !schema.trim() || !table.trim()) return;
    setPreviewing(true);
    setError(null);
    try {
      const previewResult = await api.previewUcTable(
        project.project_id,
        catalog.trim(),
        schema.trim(),
        table.trim(),
      );
      setColumns(previewResult.columns);
      setRowCount(previewResult.row_count);
      setSampleRows(previewResult.sample_rows);
      if (!name.trim()) {
        setName(table.trim().replace(/_/g, ' '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
      setColumns([]);
      setRowCount(null);
      setSampleRows([]);
    } finally {
      setPreviewing(false);
    }
  };

  const bind = async () => {
    if (!name.trim() || !catalog.trim() || !schema.trim() || !table.trim()) return;
    setBinding(true);
    setError(null);
    try {
      await api.bindLookup(project.project_id, {
        name: name.trim(),
        source_catalog: catalog.trim(),
        source_schema: schema.trim(),
        source_table: table.trim(),
        columns: columns.length > 0 ? columns : undefined,
      });
      onBound();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bind failed');
    } finally {
      setBinding(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Bind Unity Catalog table</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Link an existing UC table as read-only lookup data. Rows are loaded live from the source table.
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
          <TextField
            size="small"
            label="Catalog"
            value={catalog}
            onChange={(e) => setCatalog(e.target.value)}
          />
          <TextField
            size="small"
            label="Schema"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
          />
          <TextField
            size="small"
            label="Table"
            value={table}
            onChange={(e) => setTable(e.target.value)}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <BusyButton variant="outlined" onClick={preview} busy={previewing} busyLabel="Loading…">
            Preview table
          </BusyButton>
        </Box>
        {rowCount != null && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            {rowCount.toLocaleString()} rows · {columns.length} columns detected
          </Typography>
        )}
        {columns.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Columns
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map((col) => (
                  <TableRow key={col.key}>
                    <TableCell>{col.key}</TableCell>
                    <TableCell>{col.label}</TableCell>
                    <TableCell>{col.type ?? 'text'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {sampleRows.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Sample loaded — full table will be used in forms.
              </Typography>
            )}
          </Box>
        )}
        <TextField
          fullWidth
          size="small"
          label="Lookup name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 1 }}
        />
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <BusyButton
          variant="contained"
          onClick={bind}
          busy={binding}
          busyLabel="Binding…"
          disabled={!name.trim() || columns.length === 0}
        >
          Bind lookup
        </BusyButton>
      </DialogActions>
    </Dialog>
  );
}
