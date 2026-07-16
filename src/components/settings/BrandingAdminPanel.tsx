import { useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useBranding } from '../../branding/BrandingProvider';
import type { AppBranding, BrandingChrome, BrandingColorSet } from '../../types';
import { DEFAULT_BRANDING } from '../../lib/branding';

const MAX_LOGO_BYTES = 500 * 1024;

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const hex = value.startsWith('#') ? value : '#005288';
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField
        label={label}
        size="small"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value.startsWith('#') && (
        <input
          type="color"
          aria-label={`${label} picker`}
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer' }}
        />
      )}
    </Stack>
  );
}

function ColorSetFields({
  title,
  colors,
  onChange,
}: {
  title: string;
  colors: BrandingColorSet;
  onChange: (next: BrandingColorSet) => void;
}) {
  const [open, setOpen] = useState(false);
  const set = (key: keyof BrandingColorSet, value: string) =>
    onChange({ ...colors, [key]: value });

  return (
    <Box>
      <Button
        size="small"
        endIcon={
          <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : undefined, transition: '0.2s' }} />
        }
        onClick={() => setOpen((v) => !v)}
        sx={{ mb: 1 }}
      >
        {title}
      </Button>
      <Collapse in={open}>
        <Stack spacing={1.5}>
          {(Object.keys(colors) as (keyof BrandingColorSet)[]).map((key) => (
            <ColorField
              key={key}
              label={key.replace(/_/g, ' ')}
              value={colors[key]}
              onChange={(v) => set(key, v)}
            />
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
}

function ChromeFields({
  chrome,
  onChange,
}: {
  chrome: BrandingChrome;
  onChange: (next: BrandingChrome) => void;
}) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof BrandingChrome, value: string) =>
    onChange({ ...chrome, [key]: value });

  return (
    <Box>
      <Button
        size="small"
        endIcon={
          <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : undefined, transition: '0.2s' }} />
        }
        onClick={() => setOpen((v) => !v)}
        sx={{ mb: 1 }}
      >
        Header & sidebar (chrome)
      </Button>
      <Collapse in={open}>
        <Stack spacing={1.5}>
          {(Object.keys(chrome) as (keyof BrandingChrome)[]).map((key) => (
            <ColorField
              key={key}
              label={key.replace(/_/g, ' ')}
              value={chrome[key]}
              onChange={(v) => set(key, v)}
            />
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
}

export default function BrandingAdminPanel() {
  const { branding, updateBranding, resetBranding } = useBranding();
  const [draft, setDraft] = useState<AppBranding>(branding);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onLogoPick = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setError('Logo must be 500 KB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setDraft((prev) => ({ ...prev, logo_data_url: dataUrl }));
      setError(null);
    };
    reader.onerror = () => setError('Could not read logo file.');
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateBranding({
        app_title: draft.app_title,
        agency_name: draft.agency_name,
        logo_data_url: draft.logo_data_url,
        clear_logo: !draft.logo_data_url,
        chrome: draft.chrome,
        light: draft.light,
        dark: draft.dark,
      });
      setMessage('Branding saved. Changes apply for all users on next load.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const restored = await resetBranding();
      setDraft(restored);
      setMessage('Branding reset to defaults.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper className="page-card" sx={{ p: 2.5, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        App branding
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Customize the logo, application title, and colors for light and dark mode. Only app
        administrators can change these settings.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="Application title"
          value={draft.app_title}
          onChange={(e) => setDraft((p) => ({ ...p, app_title: e.target.value }))}
          fullWidth
        />
        <TextField
          label="Agency / organization name"
          value={draft.agency_name}
          onChange={(e) => setDraft((p) => ({ ...p, agency_name: e.target.value }))}
          fullWidth
        />

        <Box>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Logo
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {draft.logo_data_url ? (
              <img
                src={draft.logo_data_url}
                alt="Current logo"
                style={{ maxHeight: 48, maxWidth: 200, objectFit: 'contain' }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Using default DHS wordmark
              </Typography>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              hidden
              onChange={(e) => onLogoPick(e.target.files?.[0] ?? null)}
            />
            <Button variant="outlined" size="small" onClick={() => fileRef.current?.click()}>
              Upload logo
            </Button>
            {draft.logo_data_url && (
              <Button
                variant="text"
                size="small"
                color="secondary"
                onClick={() => setDraft((p) => ({ ...p, logo_data_url: null }))}
              >
                Remove logo
              </Button>
            )}
          </Stack>
        </Box>

        <ChromeFields
          chrome={draft.chrome}
          onChange={(chrome) => setDraft((p) => ({ ...p, chrome }))}
        />
        <ColorSetFields
          title="Light mode colors"
          colors={draft.light}
          onChange={(light) => setDraft((p) => ({ ...p, light }))}
        />
        <ColorSetFields
          title="Dark mode colors"
          colors={draft.dark}
          onChange={(dark) => setDraft((p) => ({ ...p, dark }))}
        />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" disabled={saving} onClick={save}>
            Save branding
          </Button>
          <Button
            variant="outlined"
            disabled={saving}
            onClick={() => setDraft(DEFAULT_BRANDING)}
          >
            Revert draft
          </Button>
          <Button variant="text" color="warning" disabled={saving} onClick={reset}>
            Reset to defaults
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
