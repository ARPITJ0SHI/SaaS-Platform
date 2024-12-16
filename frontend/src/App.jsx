import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Container } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/public/LandingPage";

import CartPage from "./pages/public/CartPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

import PaymentSuccessPage from "./pages/public/PaymentSuccessPage";

import UserDashboard from "./pages/user/UserDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";

import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import ManagePlans from "./pages/superadmin/ManagePlans";
import ManageOrganizations from "./pages/superadmin/ManageOrganizations";

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const theme = createTheme({
  palette: {
    primary: {
      main: '#6A1B9A',
      light: '#9C27B0',
      dark: '#4A148C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#512DA8',
      light: '#7C4DFF',
      dark: '#311B92',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8F9FF',
      paper: '#FFFFFF',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          margin: 0,
          padding: 0,
          height: '100%',
          width: '100%'
        },
        '#root': {
          height: '100%',
          width: '100%'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment/success"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<UserDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Super Admin Routes */}
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <SuperAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="manage-plans" element={<ManagePlans />} />
              <Route
                path="manage-organizations"
                element={<ManageOrganizations />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
