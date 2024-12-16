import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
     
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ error: "Network error occurred" });
  }
);


export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        throw new Error(error.errors[0].msg);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },
};

export const planService = {
  getAllPlans: async () => {
    const response = await api.get("/plans");
    return response.data;
  },

  getPlan: async (id) => {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post("/plans", planData);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await api.put(`/plans/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  },
};


export const organizationService = {
  getAllOrganizations: async () => {
    const response = await api.get("/organizations");
    return response.data;
  },

  getOrganization: async (id) => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },

  createOrganization: async (orgData) => {
    const response = await api.post("/organizations", orgData);
    return response.data;
  },

  updateOrganization: async (id, orgData) => {
    const response = await api.put(`/organizations/${id}`, orgData);
    return response.data;
  },

  deleteOrganization: async (id) => {
    const response = await api.delete(`/organizations/${id}`);
    return response.data;
  },

  permanentlyDeleteOrganization: async (id) => {
    const response = await api.delete(`/organizations/${id}/permanent`);
    return response.data;
  },

  toggleOrganizationStatus: async (id) => {
    const response = await api.post(`/organizations/${id}/toggle-status`);
    return response.data;
  },

  getOrganizationUsers: async (id) => {
    const response = await api.get(`/organizations/${id}/users`);
    return response.data;
  },
};


export const userService = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },

  getOrganizationUsers: async () => {
    const response = await api.get("/users/organization");
    return response.data;
  },

  inviteUser: async (userData) => {
    const response = await api.post("/users/invite", userData);
    return response.data;
  },

  removeUser: async (userId) => {
    try {
      const response = await api.delete(`/auth/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Remove user error:", error);
      throw error;
    }
  },

  addUser: async (userData) => {
    try {
      const response = await api.post("/auth/register-user", userData);
      return response.data;
    } catch (error) {
      console.error("Add user error:", error);
      throw error;
    }
  },
};


export const paymentService = {
  createSubscription: async (planId) => {
    const response = await api.post("/stripe/subscribe", { planId });
    return response.data;
  },

  getSubscriptionDetails: async () => {
    const response = await api.get("/stripe/subscription");
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post("/stripe/cancel");
    return response.data;
  },
};


export const usageService = {
  getCurrentUsage: async () => {
    const response = await api.get("/usage/current");
    return response.data;
  },

  getUsageHistory: async () => {
    const response = await api.get("/usage/history");
    return response.data;
  },
};
