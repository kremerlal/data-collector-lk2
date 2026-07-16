import { useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api } from '../../api/client';
import type { ProjectDetail } from '../../types';
import BusyButton from '../common/BusyButton';

interface MembersPanelProps {
  project: ProjectDetail;
  onChanged: () => void;
}

export default function MembersPanel({ project, onChanged }: MembersPanelProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('reader');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const add = async () => {
    if (!email.trim()) return;
    setSaving(true);
    try {
      await api.addMember(project.project_id, email.trim(), role);
      setEmail('');
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (memberEmail: string) => {
    setRemoving(memberEmail);
    try {
      await api.removeMember(project.project_id, memberEmail);
      onChanged();
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Members
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
        />
        <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)} size="small" sx={{ width: 140 }}>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="editor">Editor</MenuItem>
          <MenuItem value="reader">Reader</MenuItem>
        </TextField>
        <BusyButton variant="contained" onClick={add} busy={saving} busyLabel="Adding…" disabled={!email.trim()}>
          Add
        </BusyButton>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {project.members.map((member) => (
            <TableRow key={member.user_email}>
              <TableCell>{member.user_email}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell align="right">
                <BusyButton
                  size="small"
                  color="error"
                  onClick={() => remove(member.user_email)}
                  busy={removing === member.user_email}
                  busyLabel="Removing…"
                >
                  Remove
                </BusyButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
