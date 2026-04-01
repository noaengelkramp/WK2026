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
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { adminService } from '../../services/adminService';
import type { CreateEventData, Event } from '../../services/adminService';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';

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
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>(defaultEventForm);
  const [bootstrappingEventId, setBootstrappingEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

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

  const openEditEventDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      code: event.code,
      name: event.name,
      subdomain: event.subdomain,
      customerPrefix: event.customerPrefix,
      defaultLocale: event.defaultLocale,
      allowedLocales: event.allowedLocales,
      timezone: event.timezone,
      legalPrivacyUrl: event.legalPrivacyUrl || '',
      legalTermsUrl: event.legalTermsUrl || '',
      legalCookieUrl: event.legalCookieUrl || '',
      isActive: event.isActive,
    });
    setOpenEditDialog(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    try {
      setError(null);
      await adminService.updateEvent(editingEvent.id, {
        name: formData.name,
        subdomain: formData.subdomain,
        customerPrefix: formData.customerPrefix,
        defaultLocale: formData.defaultLocale,
        allowedLocales: formData.allowedLocales,
        timezone: formData.timezone,
        legalPrivacyUrl: formData.legalPrivacyUrl,
        legalTermsUrl: formData.legalTermsUrl,
        legalCookieUrl: formData.legalCookieUrl,
        isActive: formData.isActive,
      });
      setSuccess('Event updated successfully');
      setOpenEditDialog(false);
      setEditingEvent(null);
      setFormData(defaultEventForm);
      loadEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update event');
    }
  };

  const handleBootstrapEvent = async (event: Event) => {
    try {
      setError(null);
      setBootstrappingEventId(event.id);
      const result = await adminService.bootstrapEvent(event.id);
      setSuccess(
        `${event.name} initialized: ${result.created.scoringRules} scoring rules, ${result.created.bonusQuestions} bonus questions, ${result.created.prizes} prizes`
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to bootstrap event defaults');
    } finally {
      setBootstrappingEventId(null);
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
              <TableCell>Edit</TableCell>
              <TableCell>Bootstrap</TableCell>
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
                <TableCell>
                  <Tooltip title="Edit event configuration">
                    <span>
                      <IconButton color="primary" onClick={() => openEditEventDialog(event)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Initialize scoring rules, bonus questions, and default prizes">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={() => handleBootstrapEvent(event)}
                        disabled={bootstrappingEventId === event.id}
                      >
                        {bootstrappingEventId === event.id ? <CircularProgress size={20} /> : <BuildIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
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

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Code" fullWidth value={formData.code} disabled helperText="Code cannot be changed" />
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
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateEvent}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
