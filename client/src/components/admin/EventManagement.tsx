import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { adminService } from '../../services/adminService';
import type { CreateEventData, Event } from '../../services/adminService';

const defaultEventForm: CreateEventData = {
  code: '',
  name: '',
  subdomain: '',
  customerPrefix: 'C1234',
  defaultLocale: 'en',
  allowedLocales: ['en'],
  timezone: 'Europe/Amsterdam',
  legalPrivacyUrl: '',
  legalTermsUrl: '',
  legalCookieUrl: '',
  isActive: true,
};

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>(defaultEventForm);

  const loadEvents = async () => {
    try {
      setError(null);
      const items = await adminService.getEvents();
      setEvents(items);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load events');
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async () => {
    try {
      setError(null);
      const payload: CreateEventData = {
        ...formData,
        allowedLocales: formData.allowedLocales,
      };
      await adminService.createEvent(payload);
      setSuccess('Event created successfully');
      setOpenCreateDialog(false);
      setFormData(defaultEventForm);
      loadEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create event');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Event Management
        </Typography>
        <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
          Create Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Subdomain</TableCell>
              <TableCell>Customer Prefix</TableCell>
              <TableCell>Locales</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.code}</TableCell>
                <TableCell>{event.subdomain}</TableCell>
                <TableCell>{event.customerPrefix}</TableCell>
                <TableCell>{event.allowedLocales.join(', ')}</TableCell>
                <TableCell>
                  <Chip label={event.isActive ? 'Active' : 'Inactive'} color={event.isActive ? 'success' : 'default'} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Code" fullWidth value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Subdomain" fullWidth value={formData.subdomain} onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Customer Prefix" fullWidth value={formData.customerPrefix} onChange={(e) => setFormData({ ...formData, customerPrefix: e.target.value })} helperText="Format C1234" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Default Locale" fullWidth value={formData.defaultLocale} onChange={(e) => setFormData({ ...formData, defaultLocale: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Allowed Locales (comma-separated)" fullWidth value={formData.allowedLocales.join(', ')} onChange={(e) => setFormData({ ...formData, allowedLocales: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />
            </Grid>
            <Grid size={12}>
              <TextField label="Timezone" fullWidth value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField label="Legal Privacy URL" fullWidth value={formData.legalPrivacyUrl} onChange={(e) => setFormData({ ...formData, legalPrivacyUrl: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField label="Legal Terms URL" fullWidth value={formData.legalTermsUrl} onChange={(e) => setFormData({ ...formData, legalTermsUrl: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField label="Legal Cookie URL" fullWidth value={formData.legalCookieUrl} onChange={(e) => setFormData({ ...formData, legalCookieUrl: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch checked={!!formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                <Typography>Active</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateEvent}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
