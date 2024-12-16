import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/api.service';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';

function CartPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    
    const planData = localStorage.getItem('selectedPlan');
    if (!planData) {
      navigate('/plans');
      return;
    }
    setSelectedPlan(JSON.parse(planData));
  }, [navigate]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRemoveItem = (itemId) => {
    
    console.log('Remove item:', itemId);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    
    console.log('Update quantity:', itemId, newQuantity);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const session = await paymentService.createSubscription(selectedPlan.id);
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' 
                     : user?.role === 'superadmin' ? '/superadmin/dashboard'
                     : '/user/dashboard';

  if (!selectedPlan) {
    return null;
  }

  const cartData = {
    items: [{
      id: selectedPlan.id,
      name: selectedPlan.name,
      price: `₹${selectedPlan.price}`,
      period: `Per ${selectedPlan.billingCycle}`,
      features: selectedPlan.features,
      maxUsers: selectedPlan.maxUsers
    }],
    summary: {
      subtotal: `₹${selectedPlan.price}`,
     
      total: `₹${selectedPlan.price }`
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      bgcolor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'background.paper', 
          color: 'text.primary',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }} 
        elevation={0}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ 
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(128, 0, 128, 0.08)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ 
            fontWeight: 600, 
            background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            flexGrow: 0, 
            mr: 4 
          }}>
            Shopping Cart
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1}>
            <Button
              color="inherit"
              onClick={() => navigate(dashboardPath)}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(128, 0, 128, 0.08)',
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{
                border: '2px solid rgba(128, 0, 128, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(128, 0, 128, 0.08)',
                }
              }}
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)'
              }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 12, pb: 8 }}>
        <Container maxWidth="lg">
          {cartData.items.length > 0 ? (
            <Grid container spacing={4}>
              {/* Cart Items */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ 
                  p: 4, 
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                }}>
                  <Typography variant="h6" sx={{ 
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
                      background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
                      borderRadius: '2px'
                    }
                  }}>Cart Items</Typography>
                  <List>
                    {cartData.items.map((item) => (
                      <React.Fragment key={item.id}>
                        <ListItem alignItems="flex-start" sx={{ 
                          py: 3,
                          borderRadius: '12px',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.02)'
                          }
                        }}>
                          <ListItemText
                            primary={
                              <Typography variant="h6" component="div" sx={{ 
                                mb: 1,
                                fontWeight: 600,
                                color: '#2c3e50'
                              }}>
                                {item.name}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {item.period}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  Maximum Users: {item.maxUsers}
                                </Typography>
                                <List dense>
                                  {item.features.map((feature, index) => (
                                    <ListItem key={index} sx={{ 
                                      px: 0,
                                      py: 0.5
                                    }}>
                                      <ListItemText 
                                        primary={feature}
                                        primaryTypographyProps={{
                                          variant: 'body2',
                                          color: 'text.secondary',
                                          sx: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            '&:before': {
                                              content: '"•"',
                                              color: 'primary.main',
                                              fontWeight: 'bold',
                                              fontSize: '1.2rem',
                                              marginRight: '8px'
                                            }
                                          }
                                        }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="h6" sx={{
                              background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontWeight: 600
                            }}>
                              {item.price}
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Order Summary */}
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ 
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
                        background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
                        borderRadius: '2px'
                      }
                    }}>
                      Order Summary
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText primary="Subtotal" />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {cartData.summary.subtotal}
                        </Typography>
                      </ListItem>
                     
                      <Divider sx={{ my: 2 }} />
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary={
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Total
                            </Typography>
                          }
                        />
                        <Typography variant="h6" sx={{
                          background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: 600
                        }}>
                          {cartData.summary.total}
                        </Typography>
                      </ListItem>
                    </List>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleCheckout}
                      disabled={loading}
                      sx={{ 
                        mt: 3,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #7f0a7f 40%, #7f0a7f 100%)',
                          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Proceed to Checkout'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <CartIcon sx={{ 
                fontSize: 80, 
                color: 'text.secondary', 
                mb: 3,
                opacity: 0.5
              }} />
              <Typography variant="h5" sx={{ 
                mb: 2,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Your cart is empty
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Add some plans to your cart to proceed with the purchase.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/plans')}
                sx={{ 
                  py: 1.5,
                  px: 4,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7f0a7f 40%, #7f0a7f 100%)',
                    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
                  }
                }}
              >
                Browse Plans
              </Button>
            </Paper>
          )}
        </Container>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        <MenuItem onClick={handleLogout} sx={{
          py: 1.5,
          px: 2.5,
          '&:hover': {
            backgroundColor: 'rgba(128, 0, 128, 0.08)',
          }
        }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default CartPage; 