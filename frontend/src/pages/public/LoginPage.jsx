import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Button,
  TextField,
  Link,
  Paper,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import { useAuth } from "../../contexts/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);

      const dashboardRoutes = {
        superadmin: "/superadmin/dashboard",
        admin: "/admin/dashboard",
        user: "/user/dashboard",
      };

      const dashboardRoute = dashboardRoutes[response.user.role];
      if (dashboardRoute) {
        navigate(dashboardRoute, { replace: true });
      } else {
        throw new Error("Invalid user role");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "url(https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&w=1920)",
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
            "linear-gradient(135deg, rgba(26, 35, 126, 0.2) 0%, rgba(106, 27, 154, 0.2) 100%)",
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          px: 3,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <BusinessIcon
              sx={{
                fontSize: 36,
                color: "primary.main",
                mb: 2,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue to your account
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                  fontWeight: 500,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;
