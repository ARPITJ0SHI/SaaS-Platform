import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

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

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user/dashboard' },
    
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ 
        bgcolor: 'background.paper', 
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}>
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <Typography variant="h6" component="div" sx={{ 
            fontWeight: 600, 
            color: 'primary.main', 
            flexGrow: 0, 
            mr: 3,
            fontSize: '1.25rem',
          }}>
            User Portal
          </Typography>
          
          <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  borderBottom: location.pathname === item.path ? 2 : 0,
                  borderColor: 'primary.main',
                  borderRadius: 0,
                  px: 2,
                  py: 1,
                  minHeight: '56px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(106, 27, 154, 0.04)',
                    color: 'primary.main',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(106, 27, 154, 0.08)',
                },
              }}
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main',
              }}>
                <PersonIcon sx={{ fontSize: '1.2rem' }} />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '56px',
          width: '100%',
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <Outlet />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
       
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default UserLayout;