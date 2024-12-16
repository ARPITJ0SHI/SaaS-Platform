import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
  Stack,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 40 }} />,
      title: "Quick Setup",
      description: "Get started in minutes with our easy-to-use platform",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Enterprise Security",
      description: "Bank-grade security for your organization's data",
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: "High Performance",
      description: "Lightning-fast performance for all your operations",
    },
  ];

  return (
    <Box 
      component="main" 
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto"
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          color: "white",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          margin: 0,
          padding: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "url(https://plus.unsplash.com/premium_photo-1661414415246-3e502e2fb241?auto=format&fit=crop&w=1920)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(26, 35, 126, 0.3) 0%, rgba(106, 27, 154, 0.3) 100%)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ maxWidth: 600 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                    fontWeight: 700,
                    mb: 2,
                    background: "linear-gradient(45deg, #fff 30%, #e3f2fd 90%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Enterprise SaaS Platform
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    lineHeight: 1.6,
                  }}
                >
                  Empower your organization with our comprehensive management
                  solution
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/register")}
                    sx={{
                      py: 1.5,
                      px: 4,
                      bgcolor: "#fff",
                      color: "#1a237e",
                      fontSize: "1rem",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#fff",
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            fontWeight: 700,
            mb: 6,
            color: "text.primary",
          }}
        >
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box sx={{ color: "primary.main", mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default LandingPage;
