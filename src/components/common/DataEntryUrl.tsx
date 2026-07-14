import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { collectionDataPath, collectionDataUrl } from '../../lib/collectionPaths';

interface DataEntryUrlProps {
  projectId: string;
  /** compact = single-line for table cells; full = stacked label + url */
  variant?: 'compact' | 'full';
}

export default function DataEntryUrl({ projectId, variant = 'compact' }: DataEntryUrlProps) {
  const [copied, setCopied] = useState(false);
  const url = collectionDataUrl(projectId);
  const path = collectionDataPath(projectId);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (variant === 'full') {
    return (
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Data entry URL
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
            bgcolor: 'action.hover',
            borderRadius: 1,
            px: 1.25,
            py: 0.75,
          }}
        >
          <Typography
            component="a"
            href={path}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              color: 'primary.main',
              textDecoration: 'none',
              flex: 1,
              minWidth: 0,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {url}
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy URL'}>
            <IconButton size="small" onClick={() => void copy()} aria-label="Copy data entry URL">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open data entry view">
            <IconButton
              size="small"
              component="a"
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open data entry view"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
      <Typography
        component="a"
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        variant="caption"
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          color: 'text.secondary',
          textDecoration: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: { xs: 160, sm: 280, md: 360 },
          '&:hover': { color: 'primary.main', textDecoration: 'underline' },
        }}
        title={url}
      >
        {url}
      </Typography>
      <Tooltip title={copied ? 'Copied!' : 'Copy URL'}>
        <IconButton size="small" onClick={() => void copy()} aria-label="Copy data entry URL" sx={{ p: 0.25 }}>
          <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
