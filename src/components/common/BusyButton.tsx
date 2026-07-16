import Button, { type ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface BusyButtonProps extends ButtonProps {
  busy?: boolean;
  busyLabel?: string;
}

export default function BusyButton({
  busy = false,
  busyLabel,
  children,
  disabled,
  startIcon,
  ...props
}: BusyButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || busy}
      startIcon={busy ? <CircularProgress size={16} color="inherit" /> : startIcon}
    >
      {busy && busyLabel ? busyLabel : children}
    </Button>
  );
}
