import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../../contexts/AuthContext';
import { planService, userService, paymentService } from '../../services/api.service';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

  const [newRole, setNewRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    fetchData();
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('success') === 'true') {
      setTimeout(fetchData, 2000);
    }
  }, [location.search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');

      const [plansData, usersData, subscriptionData] = await Promise.all([
        planService.getAllPlans(),
        userService.getOrganizationUsers(),
        paymentService.getSubscriptionDetails(),
      ]);

      console.log('Fetched data:', {
        plans: plansData,
        users: usersData,
        subscription: subscriptionData,
        activePlan: subscriptionData.organization?.activePlan,
      });

      setPlans(plansData);
      setUsers(usersData);
      setSubscription(subscriptionData.subscription);
      setCurrentPlan(subscriptionData.organization?.activePlan || subscriptionData.plan);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanPurchase = async (plan) => {
    try {
      localStorage.setItem('selectedPlan', JSON.stringify({
        id: plan._id,
        name: plan.name,
        price: plan.price,
        maxUsers: plan.maxUsers,
        features: plan.features,
        billingCycle: plan.billingCycle,
      }));

      navigate('/cart');
    } catch (error) {
      toast.error('Failed to process plan selection');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      try {
        console.log('Attempting to remove user:', userId);
        const result = await userService.removeUser(userId);
        console.log('Remove user result:', result);
        toast.success(result.message || 'User removed successfully');
        fetchData();
        handleMenuClose();
      } catch (error) {
        console.error('Error removing user:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to remove user';
        toast.error(errorMessage);
      }
    }
  };

  const handleMenuClick = (event, user) => {
    setSelectedUser(user);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddUser = async () => {
    try {
      console.log('Adding new user:', newUser);
      console.log('Current plan details:', {
        currentPlan,
        subscription,
        userCount: users.filter((u) => u.role === 'user').length,
      });

      if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
        toast.error('Please fill in all required fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (newUser.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
        toast.error('Please activate your subscription to add users');
        return;
      }

      const currentUserCount = users.filter((u) => u.role === 'user').length;
      const maxUsers = subscription?.maxUsers || currentPlan?.maxUsers || 0;
      const planName = subscription?.planName || currentPlan?.name;

      console.log('User count check:', {
        currentCount: currentUserCount,
        maxAllowed: maxUsers,
        planName,
      });

      if (currentUserCount >= maxUsers) {
        toast.error(`User limit reached (${currentUserCount}/${maxUsers}) for ${planName} plan. Please upgrade your plan to add more users.`);
        return;
      }

      const result = await userService.addUser(newUser);
      toast.success('User added successfully');
      setOpenAddUserDialog(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
  };

  const UserCountDisplay = () => {
    const currentUserCount = users.filter((u) => u.role === 'user').length;
    const maxUsers = subscription?.maxUsers || currentPlan?.maxUsers || 0;
    const planName = subscription?.planName || currentPlan?.name;

    return (
      <Typography variant="body2" color="textSecondary">
        {currentUserCount} / {maxUsers} users
        {planName && ` (${planName} plan)`}
      </Typography>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      width: '100%', 
      height: '100vh', 
      overflowY: 'auto',
      bgcolor: '#f5f5f5'
    }}>
      <Container maxWidth="lg">
       
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 1,
            background: 'linear-gradient(45deg, purple 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome, {user?.firstName}!
          </Typography>
          <Typography color="textSecondary" variant="h6">
            Manage your organization's users and subscription
          </Typography>
        </Box>

        {/* Current Plan Section */}
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Current Plan</Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>{currentPlan?.name || 'No Plan'}</Typography>
              <Typography variant="h4" sx={{ mb: 2 }}>₹{currentPlan?.price || 0}/year</Typography>
              <Typography>Users: {subscription?.userCount || 0} / {currentPlan?.maxUsers || 0}</Typography>
              <Typography>Status: {subscription?.status || 'inactive'}</Typography>
              <Typography>Expires: {subscription?.endDate || 'N/A'}</Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/cart')}
            >
              Renew Plan
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Features:</Typography>
            <Grid container spacing={2}>
              {currentPlan?.features?.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Typography sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '&:before': {
                      content: '"•"',
                      color: 'primary.main',
                      fontWeight: 'bold',
                      fontSize: '1.5rem',
                      marginRight: '8px'
                    }
                  }}>
                    {feature}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>

        {/* Available Plans Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ 
            mb: 3, 
            fontWeight: 600,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              borderRadius: '2px'
            }
          }}>
            Available Plans
          </Typography>
          <Grid container spacing={3}>
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} lg={4} key={plan._id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>{plan.name}</Typography>
                    <Typography variant="h4" sx={{ my: 2, fontWeight: 600 }}>₹{plan.price}/year</Typography>
                    <Typography variant="body1">Max Users: {plan.maxUsers}</Typography>
                    <Box sx={{ flexGrow: 1, my: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Features:</Typography>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {plan.features?.map((feature, index) => (
                          <li key={index}>
                            <Typography variant="body2">{feature}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => handlePlanPurchase(plan)}
                      disabled={plan._id === currentPlan?.id}
                      sx={{ mt: 'auto' }}
                    >
                      {plan._id === currentPlan?.id ? 'Current Plan' : plan.price === 0 ? 'Start Free Trial' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* User Management Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '60px',
                height: '4px',
                backgroundColor: 'primary.main',
                borderRadius: '2px'
              }
            }}>
              User Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenAddUserDialog(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
              }}
            >
              Add User
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((usr) => (
                    <TableRow key={usr._id} hover>
                      <TableCell>{usr.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={usr.role}
                          color={usr.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                          sx={{ minWidth: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={usr.isActive ? 'Active' : 'Inactive'}
                          color={usr.isActive ? 'success' : 'error'}
                          size="small"
                          sx={{ minWidth: 80 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={usr._id === user?._id ? "Can't modify your own account" : "User Actions"}>
                          <span>
                            <IconButton
                              onClick={(e) => handleMenuClick(e, usr)}
                              disabled={usr._id === user?._id}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Add User Dialog */}
        <Dialog
          open={openAddUserDialog}
          onClose={() => setOpenAddUserDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              maxWidth: '500px',
              width: '100%'
            },
          }}
        >
          <DialogTitle sx={{ 
            pb: 2, 
            pt: 3, 
            px: 3,
            borderBottom: '1px solid #f0f0f0',
            fontSize: '1.5rem',
            fontWeight: 600
          }}>
            Add New User
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenAddUserDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddUser}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 120,
              mt: 1,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              borderRadius: 2,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleRemoveUser(selectedUser?._id);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            Remove User
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
