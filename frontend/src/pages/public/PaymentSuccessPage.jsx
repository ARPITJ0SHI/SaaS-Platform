import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useAuth } from '../../contexts/AuthContext';

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' 
                     : user?.role === 'superadmin' ? '/superadmin/dashboard'
                     : '/user/dashboard';

  React.useEffect(() => {
   
    localStorage.removeItem('selectedPlan');
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #2C3333 0%, #1A1F1F 100%)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'auto',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: '1px solid rgba(114, 47, 55, 0.2)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Payment Successful!
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for your purchase. Your subscription has been activated successfully.
          </Typography>

          <Grid container spacing={3} sx={{ maxWidth: 600, margin: '0 auto' }}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<DashboardIcon />}
                onClick={() => navigate(dashboardPath)}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Go to Dashboard
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(114, 47, 55, 0.1)', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              What's Next?
            </Typography>
            <Typography color="text.secondary">
              Your subscription is now active, and you can start using all features
              of your plan immediately. You can now add users and manage your organization
              based on your subscription plan limits.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default PaymentSuccessPage; 