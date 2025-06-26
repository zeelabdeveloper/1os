import axios from "axios";

const API_URL = "/api/permissions";

// Get all routes
export const getAllRoutes = async () => {
  const response = await axios.get(`${API_URL}/routes`);
  return response.data;
};

// Get permissions for role
export const getRolePermissions = async (roleId) => {
  const response = await axios.get(`${API_URL}/role/${roleId}`);
  return response.data;
};

// Update permissions for role
export const updatePermissions = async (roleId, childRoutes) => {
  const response = await axios.put(`${API_URL}/role/${roleId}`, {
    childRoutes,
  });
  return response.data;
};

// Delete permissions for role
export const deletePermissions = async (roleId) => {
  const response = await axios.delete(`${API_URL}/role/${roleId}`);
  return response.data;
};
