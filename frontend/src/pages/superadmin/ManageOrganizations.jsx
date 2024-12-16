import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  TablePagination,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  DeleteForever as DeleteForeverIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { organizationService, planService } from '../../services/api.service';
import { toast } from 'react-toastify';

function ManageOrganizations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [selectedOrgUsers, setSelectedOrgUsers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrganizations();
    fetchPlans();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const data = await organizationService.getAllOrganizations();
      setOrganizations(data);
    } catch (error) {
      toast.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await planService.getAllPlans();
      setPlans(data);
    } catch (error) {
      toast.error('Failed to fetch plans');
    }
  };

  const handleAddOrg = () => {
    setSelectedOrg(null);
    setOpenDialog(true);
  };

  const handleEditOrg = (org) => {
    setSelectedOrg(org);
    setOpenDialog(true);
  };

  const handleDeleteOrg = async (orgId) => {
    if (window.confirm('Are you sure you want to deactivate this organization?')) {
      try {
        await organizationService.deleteOrganization(orgId);
        toast.success('Organization deactivated successfully');
        fetchOrganizations();
      } catch (error) {
        toast.error(error.message || 'Failed to deactivate organization');
      }
    }
  };

  const handleViewUsers = async (orgId) => {
    try {
      const users = await organizationService.getOrganizationUsers(orgId);
      setSelectedOrgUsers(users);
      setOpenUsersDialog(true);
    } catch (error) {
      toast.error('Failed to fetch organization users');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const orgData = {
      name: formData.get('name'),
      email: formData.get('email'),
      planId: formData.get('planId'),
    };

    try {
      if (selectedOrg) {
        await organizationService.updateOrganization(selectedOrg._id, orgData);
        toast.success('Organization updated successfully');
      } else {
        await organizationService.createOrganization(orgData);
        toast.success('Organization created successfully');
      }
      setOpenDialog(false);
      fetchOrganizations();
    } catch (error) {
      toast.error(selectedOrg ? 'Failed to update organization' : 'Failed to create organization');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'canceled':
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleToggleStatus = async (org) => {
    const action = org.isActive ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this organization?`)) {
      try {
        const result = await organizationService.toggleOrganizationStatus(org._id);
        toast.success(result.message);
        fetchOrganizations();
      } catch (error) {
        toast.error(error.message || `Failed to ${action} organization`);
      }
    }
  };

  const handlePermanentDelete = async (orgId) => {
    if (window.confirm('WARNING: This will permanently delete the organization and all its users. This action cannot be undone. Are you sure?')) {
      try {
        await organizationService.permanentlyDeleteOrganization(orgId);
        toast.success('Organization permanently deleted');
        fetchOrganizations();
      } catch (error) {
        toast.error(error.message || 'Failed to delete organization');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredOrganizations = organizations
    .filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (tabValue === 1) return matchesSearch && org.isActive && org.subscriptionStatus === 'active';
      if (tabValue === 2) return matchesSearch && org.isActive && org.subscriptionStatus === 'trialing';
      if (tabValue === 3) return matchesSearch && !org.isActive;
      return matchesSearch;
    })
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const OrganizationDialog = ({ open, onClose, org }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          mb: 2,
          pb: 2,
          fontWeight: 600 
        }}>
          {org ? 'Edit Organization' : 'Add New Organization'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Organization Name"
                defaultValue={org?.name}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Organization Email"
                type="email"
                defaultValue={org?.email}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel>Plan</InputLabel>
                <Select
                  name="planId"
                  defaultValue={org?.planId?._id || ''}
                  label="Plan"
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan._id} value={plan._id}>
                      {plan.name} - ₹{plan.price}/year
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6A1B9A 30%, #9C27B0 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #6A1B9A 40%, #9C27B0 100%)',
              }
            }}
          >
            {org ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  const UsersDialog = ({ open, onClose, users }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        mb: 2,
        pb: 2,
        fontWeight: 600 
      }}>
        Organization Users
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role}
                      size="small"
                      sx={{ 
                        bgcolor: user.role === 'admin' ? 'primary.light' : 'default',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #6A1B9A 30%, #9C27B0 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          Manage Organizations
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create and manage organizations in your system
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                placeholder="Search organizations..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 300, mr: 2 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minWidth: 100,
                  }
                }}
              >
                <Tab label="All" />
                <Tab label="Active" />
                <Tab label="Trial" />
                <Tab label="Inactive" />
              </Tabs>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddOrg}
              sx={{
                background: 'linear-gradient(45deg, #6A1B9A 30%, #9C27B0 90%)',
                color: 'white',
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(45deg, #6A1B9A 40%, #9C27B0 100%)',
                }
              }}
            >
              Add Organization
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#6A1B9A' }} />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Users</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow key={org._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: 'primary.light',
                                width: 35,
                                height: 35
                              }}
                            >
                              {org.name.charAt(0)}
                            </Avatar>
                            {org.name}
                          </Box>
                        </TableCell>
                        <TableCell>{org.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={org.planId?.name || 'No Plan'} 
                            size="small"
                            sx={{ bgcolor: 'primary.light', color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>{org.activeUsers}</TableCell>
                        <TableCell>
                          <Chip
                            label={org.subscriptionStatus}
                            color={getStatusColor(org.subscriptionStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Users">
                            <IconButton
                              size="small"
                              onClick={() => handleViewUsers(org._id)}
                              sx={{ mr: 1 }}
                            >
                              <GroupIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditOrg(org)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={org.isActive ? "Deactivate" : "Activate"}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(org)}
                              color={org.isActive ? "success" : "warning"}
                              sx={{ mr: 1 }}
                            >
                              {org.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Permanently">
                            <IconButton
                              size="small"
                              onClick={() => handlePermanentDelete(org._id)}
                              color="error"
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={organizations.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </CardContent>
      </Card>

      <OrganizationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        org={selectedOrg}
      />

      <UsersDialog
        open={openUsersDialog}
        onClose={() => setOpenUsersDialog(false)}
        users={selectedOrgUsers}
      />
    </Box>
  );
}

export default ManageOrganizations;