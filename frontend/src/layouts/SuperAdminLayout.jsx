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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,

  Settings as SettingsIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function SuperAdminLayout() {
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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/superadmin/dashboard' },
    { text: 'Organizations', icon: <BusinessIcon />, path: '/superadmin/manage-organizations' },
    { text: 'Plans', icon: <CategoryIcon />, path: '/superadmin/manage-plans' },
    ,
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
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
          <Typography variant="h6" component="div" sx={{
            fontWeight: 600,
            background: 'linear-gradient(45deg, #7f0a7f 30%, #7f0a7f 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            flexGrow: 0,
            mr: 4
          }}>
            Super Admin
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path ? '#7f0a7f' : 'text.primary',
                  borderBottom: location.pathname === item.path ? 2 : 0,
                  borderColor: '#7f0a7f',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(128, 0, 128, 0.08)',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
      <Box component="main" sx={{ 
        flexGrow: 1, 
        mt: '64px',
        height: 'calc(100vh - 64px)',
        overflowY: 'auto'
      }}>
        <Outlet />
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

export default SuperAdminLayout;