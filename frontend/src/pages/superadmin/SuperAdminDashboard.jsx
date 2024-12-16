import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { organizationService, planService } from '../../services/api.service';
import { toast } from 'react-toastify';

function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    planDistribution: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard data...');

      const [organizations, plans] = await Promise.all([
        organizationService.getAllOrganizations(),
        planService.getAllPlans(),
      ]);

      console.log('Received data:', { organizations, plans });

      if (!organizations || !plans) {
        throw new Error('Failed to fetch data');
      }

      // Calculate stats
      const activeOrgs = organizations.filter(org => org.isActive);
      const totalUsers = organizations.reduce((sum, org) => sum + (org.activeUsers || 0), 0);
      const totalRevenue = organizations.reduce((sum, org) => {
        const plan = plans.find(p => p._id === org.planId?._id);
        return sum + (plan?.price || 0);
      }, 0);

      // Calculate plan distribution
      const planDist = plans.map(plan => ({
        name: plan.name,
        count: organizations.filter(org => org.planId?._id === plan._id).length,
        price: plan.price
      }));

      setStats({
        totalOrganizations: organizations.length,
        activeOrganizations: activeOrgs.length,
        totalUsers,
        activeUsers: activeOrgs.reduce((sum, org) => sum + (org.activeUsers || 0), 0),
        totalRevenue,
        planDistribution: planDist,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to fetch dashboard data');
      toast.error(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%'
      }}>
        <CircularProgress sx={{ color: '#7f0a7f' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        p: 3,
        textAlign: 'center'
      }}>
        <Typography variant="h5" sx={{ 
          mb: 2,
          color: '#7f0a7f',
          fontWeight: 600
        }}>
          Error Loading Dashboard
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={fetchDashboardData}
          sx={{
            background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: '8px',
            '&:hover': {
              background: 'linear-gradient(45deg, #7f0a7f 40%, #7f0a7f 100%)',
            }
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      py: 3,
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Dashboard Overview
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor your platform's performance and metrics
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 2.5,
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ 
                  fontSize: 40, 
                  color: '#7f0a7f',
                  mr: 2 
                }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.activeOrganizations}
                  </Typography>
                  <Typography color="text.secondary" variant="subtitle1">
                    Active Organizations
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Organizations: {stats.totalOrganizations}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 2.5,
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ 
                  fontSize: 40, 
                  color: '#7f0a7f',
                  mr: 2 
                }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.activeUsers}
                  </Typography>
                  <Typography color="text.secondary" variant="subtitle1">
                    Active Users
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Users: {stats.totalUsers}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 2.5,
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ 
                  fontSize: 40, 
                  color: '#7f0a7f',
                  mr: 2 
                }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    ₹{stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary" variant="subtitle1">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                From active subscriptions
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Plan Distribution */}
        <Paper sx={{ 
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}>
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
              background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
              borderRadius: '2px'
            }
          }}>
            Plan Distribution
          </Typography>
          <Grid container spacing={2}>
            {stats.planDistribution.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: '#7f0a7f',
                      mb: 1
                    }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700 
                    }}>
                      {plan.count}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" sx={{
                      color: 'text.secondary',
                      fontWeight: 500
                    }}>
                      Revenue: ₹{(plan.count * plan.price).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default SuperAdminDashboard;
