import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  LinearProgress,
  Button,
  Card,
  CardContent,
  Divider,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { userService, paymentService } from "../../services/api.service";
import { toast } from "react-toastify";

function UserDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    subscription: {
      planName: "",
      status: "",
      currentPeriodEnd: new Date(),
      maxUsers: 0,
      storage: 0,
      features: [],
    },
    usersCount: 0,
    storageUsed: 0,
    recentActivities: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const subscriptionDetails = await paymentService.getSubscriptionDetails();

      console.log("Subscription details:", subscriptionDetails);

      setDashboardData({
        subscription: {
          planName:
            subscriptionDetails.organization?.activePlan?.name || "Free Plan",
          status: subscriptionDetails.subscription?.status || "inactive",
          currentPeriodEnd:
            subscriptionDetails.subscription?.endDate || new Date(),
          maxUsers: subscriptionDetails.organization?.activePlan?.maxUsers || 1,
          storage: subscriptionDetails.organization?.activePlan?.storage || 1,
          features:
            subscriptionDetails.organization?.activePlan?.features || [],
        },
        usersCount: subscriptionDetails.subscription?.userCount || 0,
        storageUsed: 0,
        recentActivities: [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
      setDashboardData({
        subscription: {
          planName: "Error loading plan",
          status: "error",
          currentPeriodEnd: new Date(),
          maxUsers: 0,
          storage: 0,
          features: [],
        },
        usersCount: 0,
        storageUsed: 0,
        recentActivities: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/plans");
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      default:
        return "error";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #6A1B9A 30%, #9C27B0 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Welcome to Your Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor your subscription and usage details
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #6A1B9A 0%, #9C27B0 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 1 }}>
                  <SpeedIcon />
                </Avatar>
                <Typography variant="h6">Current Plan</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                {dashboardData.subscription.planName}
              </Typography>
              <Chip
                label={dashboardData.subscription.status.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: `${getStatusColor(
                    dashboardData.subscription.status
                  )}.main`,
                  color: "white",
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "primary.light", mr: 1 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Users</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                {dashboardData.usersCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {dashboardData.subscription.maxUsers} available
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "primary.light", mr: 1 }}>
                  <StorageIcon />
                </Avatar>
                <Typography variant="h6">Storage</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                  {dashboardData.storageUsed} GB
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    (dashboardData.storageUsed /
                      dashboardData.subscription.storage) *
                    100
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "rgba(0,0,0,0.1)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.subscription.storage} GB total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "primary.light", mr: 1 }}>
                  <ScheduleIcon />
                </Avatar>
                <Typography variant="h6">Renewal</Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                {new Date(
                  dashboardData.subscription.currentPeriodEnd
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(
                  dashboardData.subscription.currentPeriodEnd
                ).getFullYear()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Recent Activities
              </Typography>
              {dashboardData.recentActivities.length > 0 ? (
                <List>
                  {dashboardData.recentActivities.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={activity.description}
                          secondary={new Date(
                            activity.timestamp
                          ).toLocaleString()}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      {index < dashboardData.recentActivities.length - 1 && (
                        <Divider />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No recent activities to display
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Plan Features
              </Typography>
              <List>
                {dashboardData.subscription.features.map((feature, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                    {index < dashboardData.subscription.features.length - 1 && (
                      <Divider />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserDashboard;
