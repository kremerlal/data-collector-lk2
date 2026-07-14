import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api } from '../../api/client';
import type { StorageType } from '../../types';
import BusyButton from '../common/BusyButton';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateProjectDialog({ open, onClose, onCreated }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [storageType, setStorageType] = useState<StorageType>('uc_delta');
  const [showStorage, setShowStorage] = useState(false);
  const [targetCatalog, setTargetCatalog] = useState('');
  const [targetSchema, setTargetSchema] = useState('');
  const [targetTable, setTargetTable] = useState('');
  const [defaultCatalog, setDefaultCatalog] = useState('');
  const [defaultSchema, setDefaultSchema] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void api.getConfig().then((cfg) => {
      setDefaultCatalog(cfg.default_data_catalog);
      setDefaultSchema(cfg.default_data_schema);
      if (storageType === 'lakebase' && cfg.lakebase_configured) {
        setTargetCatalog(cfg.lakebase_database ?? '');
        setTargetSchema(cfg.lakebase_default_schema ?? cfg.default_data_schema);
      } else {
        setTargetCatalog(cfg.default_data_catalog);
        setTargetSchema(cfg.default_data_schema);
      }
    });
  }, [open, storageType]);

  const slugTableName = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 80) || 'collection';

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        storage_type: storageType,
        ...(showStorage
          ? {
              target_catalog: targetCatalog.trim() || undefined,
              target_schema: targetSchema.trim() || undefined,
              target_table: targetTable.trim() || `${slugTableName(name)}_data`,
            }
          : {}),
      });
      setName('');
      setDescription('');
      setShowStorage(false);
      setTargetTable('');
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New data collection</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
        />
        <TextField
          select
          label="Storage"
          value={storageType}
          onChange={(e) => setStorageType(e.target.value as StorageType)}
        >
          <MenuItem value="uc_delta">Unity Catalog (Delta)</MenuItem>
          <MenuItem value="lakebase">Lakebase (Postgres)</MenuItem>
        </TextField>
        <Button size="small" onClick={() => setShowStorage((v) => !v)} sx={{ alignSelf: 'flex-start' }}>
          {showStorage ? 'Hide storage location' : 'Customize storage location'}
        </Button>
        <Collapse in={showStorage}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {storageType === 'lakebase'
                ? `Records are stored in Lakebase Postgres. Defaults: ${defaultCatalog}.${defaultSchema}`
                : `Records are saved outside the app metadata schema. Defaults: ${defaultCatalog}.${defaultSchema}`}
            </Typography>
            <TextField
              label={storageType === 'lakebase' ? 'Database' : 'Catalog'}
              value={targetCatalog}
              onChange={(e) => setTargetCatalog(e.target.value)}
              size="small"
              disabled={storageType === 'lakebase'}
              helperText={storageType === 'lakebase' ? 'From Lakebase app resource (PGDATABASE)' : undefined}
            />
            <TextField
              label="Schema"
              value={targetSchema}
              onChange={(e) => setTargetSchema(e.target.value)}
              size="small"
            />
            <TextField
              label="Table"
              value={targetTable}
              onChange={(e) => setTargetTable(e.target.value)}
              placeholder={name.trim() ? `${slugTableName(name)}_data` : 'auto from name'}
              size="small"
              helperText={storageType === 'lakebase' ? 'Postgres table created on publish' : 'Delta table created on publish'}
            />
          </Box>
        </Collapse>
        {error && (
          <TextField error helperText={error} disabled sx={{ display: 'none' }} />
        )}
        {error && <span style={{ color: '#c41230', fontSize: '0.875rem' }}>{error}</span>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <BusyButton variant="contained" onClick={handleCreate} busy={saving} busyLabel="Creating…" disabled={!name.trim()}>
          Create
        </BusyButton>
      </DialogActions>
    </Dialog>
  );
}
