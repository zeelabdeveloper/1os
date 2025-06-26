import axios from 'axios';

const API_BASE_URL = '/api/v1/permission';

export const getPermissionTree = async (roleId = null) => {
  try {
    const url = roleId 
      ? `${API_BASE_URL}/tree/${roleId}`
      : `${API_BASE_URL}/tree`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to fetch permission tree'
    );
  }
};

export const updateRolePermissions = async (roleId, selectedRoutes) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/${roleId}`,
      { selectedRoutes }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to update permissions'
    );
  }
};

export const getRolePermissionsSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/summary`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to fetch permissions summary'
    );
  }
};

export default {
  getPermissionTree,
  updateRolePermissions,
  getRolePermissionsSummary,
  getRolePermissionsFlat: async (roleId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/role/${roleId}/flat`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch role permissions'
      );
    }
  },
  checkPermission: async (roleId, routePath) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/check`,
        { params: { roleId, routePath } }
      );
      return response.data.hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }
};