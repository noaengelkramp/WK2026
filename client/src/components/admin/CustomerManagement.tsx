import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Typography,
  InputAdornment,
  Tooltip,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { adminCustomerService } from '../../services/adminService';
import type { Customer, CreateCustomerData, UpdateCustomerData } from '../../services/adminService';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeOnly, setActiveOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBulkImportDialog, setOpenBulkImportDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateCustomerData>({
    customerNumber: '',
    companyName: '',
    isActive: true,
  });
  const [bulkImportText, setBulkImportText] = useState('');

  // Load customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminCustomerService.getCustomers({
        search: searchTerm,
        page: page + 1,
        limit: rowsPerPage,
        activeOnly,
      });
      setCustomers(result.customers);
      setTotalCustomers(result.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, rowsPerPage, activeOnly]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 0) {
        loadCustomers();
      } else {
        setPage(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Create customer
  const handleCreateCustomer = async () => {
    try {
      setError(null);
      await adminCustomerService.createCustomer(formData);
      setSuccess('Customer created successfully');
      setOpenCreateDialog(false);
      resetForm();
      loadCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer');
    }
  };

  // Edit customer
  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      setError(null);
      const updateData: UpdateCustomerData = {
        companyName: formData.companyName,
        isActive: formData.isActive,
      };
      await adminCustomerService.updateCustomer(selectedCustomer.id, updateData);
      setSuccess('Customer updated successfully');
      setOpenEditDialog(false);
      setSelectedCustomer(null);
      resetForm();
      loadCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update customer');
    }
  };

  // Delete customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      setError(null);
      await adminCustomerService.deleteCustomer(selectedCustomer.id);
      setSuccess('Customer deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete customer');
    }
  };

  // Bulk import
  const handleBulkImport = async () => {
    try {
      setError(null);
      // Parse CSV text (simple format: customerNumber,companyName,isActive)
      const lines = bulkImportText.trim().split('\n');
      const customers = lines
        .filter((line) => line.trim())
        .map((line) => {
          const [customerNumber, companyName, isActiveStr] = line.split(',').map((s) => s.trim());
          return {
            customerNumber,
            companyName,
            isActive: isActiveStr?.toLowerCase() !== 'false',
          };
        });

      const result = await adminCustomerService.bulkImport(customers);
      setSuccess(`Bulk import completed: ${result.success} success, ${result.failed} failed`);
      setOpenBulkImportDialog(false);
      setBulkImportText('');
      loadCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to bulk import customers');
    }
  };

  // Open dialogs
  const openCreate = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const openEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      customerNumber: customer.customerNumber,
      companyName: customer.companyName,
      isActive: customer.isActive,
    });
    setOpenEditDialog(true);
  };

  const openDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      customerNumber: '',
      companyName: '',
      isActive: true,
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Customer Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setOpenBulkImportDialog(true)}>
            Bulk Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Create Customer
          </Button>
          <IconButton onClick={loadCustomers} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by customer number or company name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={<Switch checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />}
          label="Active Only"
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Company Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>User Account</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">No customers found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {customer.customerNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{customer.companyName}</TableCell>
                  <TableCell>
                    {customer.isActive ? (
                      <Chip icon={<CheckIcon />} label="Active" color="success" size="small" />
                    ) : (
                      <Chip icon={<CancelIcon />} label="Inactive" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.user ? (
                      <Box>
                        <Typography variant="body2">{customer.user.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customer.user.firstName} {customer.user.lastName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No account
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => openEdit(customer)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={customer.user ? 'Cannot delete (has user account)' : 'Delete'}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDelete(customer)}
                            disabled={!!customer.user}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCustomers}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </TableContainer>

      {/* Create Customer Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Customer Number"
              required
              value={formData.customerNumber}
              onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
              helperText="Format: C1234_1234567"
            />
            <TextField
              label="Company Name"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCustomer} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Customer Number"
              required
              disabled
              value={formData.customerNumber}
              helperText="Customer number cannot be changed"
            />
            <TextField
              label="Company Name"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditCustomer} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete customer <strong>{selectedCustomer?.customerNumber}</strong> (
            {selectedCustomer?.companyName})?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteCustomer} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={openBulkImportDialog} onClose={() => setOpenBulkImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Import Customers</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>CSV Format (one per line):</strong>
            </Typography>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              customerNumber,companyName,isActive
            </Typography>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              C1234_0000001,Acme Corporation,true
            </Typography>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              C1234_0000002,Global Industries,true
            </Typography>
          </Alert>
          <TextField
            label="Paste CSV Data"
            multiline
            rows={10}
            fullWidth
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            placeholder="C1234_0000001,Acme Corporation,true&#10;C1234_0000002,Global Industries,true"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkImportDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkImport} variant="contained" disabled={!bulkImportText.trim()}>
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
