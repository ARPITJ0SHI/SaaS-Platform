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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { planService } from '../../services/api.service';
import { toast } from 'react-toastify';

function ManagePlans() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await planService.getAllPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      toast.error('Failed to fetch plans');
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setOpenDialog(true);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenDialog(true);
  };

  const handleDeletePlan = async (planId) => {
    try {
      await planService.deletePlan(planId);
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
      console.error('Error deleting plan:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlan(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const planData = {
      name: formData.get('name'),
      price: Number(formData.get('price')),
      billingCycle: formData.get('billingCycle'),
      maxUsers: Number(formData.get('maxUsers')),
      storage: Number(formData.get('storage')),
      features: formData.get('features').split('\n').filter(f => f.trim()),
      isActive: formData.get('status') === 'Active',
      trialDays: Number(formData.get('trialDays') || 0)
    };

    try {
      if (selectedPlan) {
        await planService.updatePlan(selectedPlan._id, planData);
        toast.success('Plan updated successfully');
      } else {
        await planService.createPlan(planData);
        toast.success('Plan created successfully');
      }
      handleCloseDialog();
      fetchPlans();
    } catch (error) {
      toast.error(selectedPlan ? 'Failed to update plan' : 'Failed to create plan');
      console.error('Error saving plan:', error);
    }
  };

  const PlanDialog = ({ open, onClose, plan }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {plan ? 'Edit Plan' : 'Add New Plan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Plan Name</InputLabel>
                <Select
                  name="name"
                  defaultValue={plan?.name || 'Basic'}
                  label="Plan Name"
                >
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Plus">Plus</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                defaultValue={plan?.price}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Billing Cycle</InputLabel>
                <Select
                  name="billingCycle"
                  defaultValue={plan?.billingCycle || 'Yearly'}
                  label="Billing Cycle"
                >
                  <MenuItem value="Trial">Trial</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="trialDays"
                label="Trial Days"
                type="number"
                defaultValue={plan?.trialDays || 0}
                fullWidth
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxUsers"
                label="Maximum Users"
                type="number"
                defaultValue={plan?.maxUsers}
                fullWidth
                required
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="storage"
                label="Storage (GB)"
                type="number"
                defaultValue={plan?.storage}
                fullWidth
                required
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="features"
                label="Features (one per line)"
                multiline
                rows={4}
                defaultValue={plan?.features?.join('\n')}
                fullWidth
                required
                helperText="Enter each feature on a new line"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  defaultValue={plan?.isActive ? 'Active' : 'Inactive'}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {plan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  return (
    <Box sx={{
      width: '100%',
      p: 3
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Manage Plans
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create and manage subscription plans
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleAddPlan}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                background: 'linear-gradient(45deg, #7f0a7f 40%, #7f0a7f 100%)',
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s'
              }
            }}
          >
            Add Plan
          </Button>
        </Box>

        {/* Main Content */}
        <Paper sx={{ 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          background: '#fff'
        }}>
          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#7f0a7f' }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                  }}>
                    <TableCell sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      fontSize: '0.95rem'
                    }}>Plan Name</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      fontSize: '0.95rem'
                    }}>Price</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      fontSize: '0.95rem'
                    }}>Billing</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      fontSize: '0.95rem'
                    }}>Users</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      fontSize: '0.95rem'
                    }}>Storage</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      fontSize: '0.95rem'
                    }}>Organizations</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      fontSize: '0.95rem'
                    }}>Status</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      fontSize: '0.95rem'
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow 
                      key={plan._id} 
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(127, 10, 127, 0.04)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600,
                            color: '#7f0a7f',
                            mb: 1
                          }}>
                            {plan.name}
                          </Typography>
                          <List dense sx={{ mt: 0.5 }}>
                            {plan.features.map((feature, index) => (
                              <ListItem key={index} sx={{ py: 0.25 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                  <CheckCircleIcon sx={{ 
                                    fontSize: 18, 
                                    color: '#7f0a7f'
                                  }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={feature}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    color: 'text.secondary',
                                    sx: { fontWeight: 500 }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          ₹{plan.price}
                        </Typography>
                      </TableCell>
                      <TableCell>{plan.billingCycle}</TableCell>
                      <TableCell>{plan.maxUsers}</TableCell>
                      <TableCell>{plan.storage}GB</TableCell>
                      <TableCell>{plan.activeOrganizations || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={plan.isActive ? 'Active' : 'Inactive'}
                          color={plan.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditPlan(plan)}
                          sx={{ 
                            color: '#7f0a7f',
                            mr: 1,
                            '&:hover': {
                              bgcolor: 'rgba(127, 10, 127, 0.08)'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePlan(plan._id)}
                          sx={{ 
                            color: '#d32f2f',
                            '&:hover': {
                              bgcolor: 'rgba(211, 47, 47, 0.08)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle sx={{ 
              pb: 1,
              color: '#7f0a7f',
              fontWeight: 600
            }}>
              {selectedPlan ? 'Edit Plan' : 'Add New Plan'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel sx={{
                      '&.Mui-focused': {
                        color: '#7f0a7f'
                      }
                    }}>Plan Name</InputLabel>
                    <Select
                      name="name"
                      defaultValue={selectedPlan?.name || 'Basic'}
                      label="Plan Name"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          '&.Mui-focused': {
                            borderColor: '#7f0a7f'
                          }
                        }
                      }}
                    >
                      <MenuItem value="Basic">Basic</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Plus">Plus</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label="Price"
                    type="number"
                    defaultValue={selectedPlan?.price}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#7f0a7f'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7f0a7f'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel sx={{
                      '&.Mui-focused': {
                        color: '#7f0a7f'
                      }
                    }}>Billing Cycle</InputLabel>
                    <Select
                      name="billingCycle"
                      defaultValue={selectedPlan?.billingCycle || 'Yearly'}
                      label="Billing Cycle"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          '&.Mui-focused': {
                            borderColor: '#7f0a7f'
                          }
                        }
                      }}
                    >
                      <MenuItem value="Trial">Trial</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="trialDays"
                    label="Trial Days"
                    type="number"
                    defaultValue={selectedPlan?.trialDays || 0}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#7f0a7f'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7f0a7f'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="maxUsers"
                    label="Maximum Users"
                    type="number"
                    defaultValue={selectedPlan?.maxUsers}
                    fullWidth
                    required
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#7f0a7f'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7f0a7f'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="storage"
                    label="Storage (GB)"
                    type="number"
                    defaultValue={selectedPlan?.storage}
                    fullWidth
                    required
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#7f0a7f'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7f0a7f'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="features"
                    label="Features (one per line)"
                    multiline
                    rows={4}
                    defaultValue={selectedPlan?.features?.join('\n')}
                    fullWidth
                    required
                    helperText="Enter each feature on a new line"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#7f0a7f'
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7f0a7f'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel sx={{
                      '&.Mui-focused': {
                        color: '#7f0a7f'
                      }
                    }}>Status</InputLabel>
                    <Select
                      name="status"
                      defaultValue={selectedPlan?.isActive ? 'Active' : 'Inactive'}
                      label="Status"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          '&.Mui-focused': {
                            borderColor: '#7f0a7f'
                          }
                        }
                      }}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseDialog}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
                  color: 'white',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7f0a7f 40%, #7f0a7f 100%)'
                  }
                }}
              >
                {selectedPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
}

export default ManagePlans;