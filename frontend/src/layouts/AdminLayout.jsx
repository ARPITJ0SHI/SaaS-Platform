import React, { useState } from "react";
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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AdminLayout() {
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
    navigate("/login");
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="static"
        sx={{
          bgcolor: "white",
          color: "primary.main",
          borderBottom: "1px solid #E8E8E8",
        }}
        elevation={0}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 700, color: "sagegreen", flexGrow: 0, mr: 4 }}
          >
            Admin Portal
          </Typography>

          <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path ? "sagegreen" : "gray",
                  borderBottom:
                    location.pathname === item.path
                      ? "2px solid sagegreen"
                      : "none",
                  borderRadius: 0,
                  px: 2,
                  py: 1,
                  textTransform: "none",
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  "&:hover": {
                    backgroundColor: "rgba(173, 216, 230, 0.2)",
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={handleProfileMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: "sagegreen" }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          minHeight: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        <Outlet />
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

export default AdminLayout;
