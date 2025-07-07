import axios from "../axiosConfig";

export const loginUser = async (credentials) => {
  const response = await axios.post("/api/v1/login", credentials, {
    withCredentials: true,
  });
  return response.data;
};

export const verifyUser = async () => {
  const response = await axios.get("/api/v1/auth/verify");
  return response.data;
};

export const sendForgotPasswordEmail = async ({ email }) => {
  const res = await axios.post("/api/v1/forgot-password", { email });
  return res.data;
};

export const fetchUser = async (credentials) => {
  const response = await axios.get("/api/v1/fetchUser", {
    withCredentials: true,
  });
  return response.data;
};
export const fetchManagers = async (credentials) => {
  const response = await axios.get("/api/v1/fetchUser", {
    withCredentials: true,
  });
  return response.data;
};

export const fetchCompanyBankAccounts = async () => {
  const { data } = await axios.get("/api/v1/finance/company/accounts");

  return data;
};

export const deleteCompanyBankAccounts = async (id) => {
  const { data } = await axios.delete(`/api/v1/finance/company/accounts/${id}`);
  return data;
};

export const addCompanyBankAccounts = async (account) => {
  const { data } = await axios.post(
    "/api/v1/finance/company/accounts",
    account
  );
  return data;
};

export const updateCompanyBankAccounts = async ({ id, data }) => {
  const response = await axios.put(
    `/api/v1/finance/company/accounts/${id}`,
    data
  );
  return response.data;
};

export const fetchBranches = async () => {
  const { data } = await axios.get("/api/v1/company/companyBranch");
  console.log(data);
  return data;
};

export const addBranch = async (f) => {
  const { data } = await axios.post("/api/v1/company/companyBranch", f);

  return data;
};

export const updateBranch = async ({ id, ...val }) => {
  const response = await axios.put(`/api/v1/company/companyBranch/${id}`, val);
  return response.data;
};

export const deleteBranch = async (id) => {
  const { data } = await axios.delete(`/api/v1/company/companyBranch/${id}`);
  return data;
};

export const fetchDepartments = async () => {
  const response = await axios.get(`/api/v1/company/departments`);
  return response.data;
};

// Fetch departments by branch

// Add new department
export const addDepartment = async (departmentData) => {
  const response = await axios.post(
    `/api/v1/company/departments`,
    departmentData
  );
  return response.data;
};

// Update department
export const updateDepartment = async ({ id, ...departmentData }) => {
  const response = await axios.put(
    `/api/v1/company/departments/${id}`,
    departmentData
  );
  return response.data;
};

// Delete department
export const deleteDepartment = async (id) => {
  const response = await axios.delete(`/api/v1/company/departments/${id}`);
  return response.data;
};

// fetch employee for head selection

export const fetchEmployees = async (isCocoStaff) => {
  const response = await axios.get(
    `/api/v1/company/departments/head?isCocoStaff=${isCocoStaff}`,
    {}
  );
  console.log(response.data);
  return response.data;
};

// for role

export const fetchRoles = async () => {
  const response = await axios.get(`/api/v1/company/roles`);

  return response.data;
};
export const fetchStoreRoles = async () => {
  const response = await axios.get(`/api/v1/store/roles`);
  return response.data;
};

export const fetchDepartmentsByBranch = async (branchId) => {
  if (!branchId) return [];
  const response = await axios.get(
    `/api/v1/company/branch/department/${branchId}`
  );

  return response.data.data;
};
export const fetchDepartmentsByHeadId = async (Head) => {
  if (!Head) return [];
  const response = await axios.get(`/api/v1/company/Head/department/${Head}`);

  return response.data.data;
};
export const fetchRoleByDepartment = async (department) => {
  if (!department) return [];
  const response = await axios.get(
    `/api/v1/company/branch/department/role/${department}`
  );
  console.log(department);
  return response.data.data;
};

export const addRole = async (roleData) => {
  const response = await axios.post(`/api/v1/company/roles`, roleData);
  return response.data;
};

export const updateRole = async ({ id, data }) => {
  const response = await axios.put(`/api/v1/company/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await axios.delete(`/api/v1/company/roles/${id}`);
  return response.data;
};

// create Staff
export const createStaff = async (userData) => {
  console.log(userData);
  const response = await axios.post("/api/v1/user/create-staff", userData);
  return response.data;
};

export const fetchStaff = async (params = {}) => {
  const { page = 1, limit = 10, search = "", sortBy, sortOrder } = params;
  const response = await axios.get("/api/v1/user/staff", {
    params: {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    },
  });
  return response.data;
};

export const deleteStaff = async (id) => {
  
  const response = await axios.delete(`/api/v1/user/staff/${id}`);
  return response.data;
};

export const updateUserStatus = async ({ id, status }) => {
  const response = await axios.patch(`/api/v1/user/staff/${id}/status`, {
    status,
  });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(API_URL, userData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateUser = async ({ id, data }) => {
  const response = await axios.put(`/api/v1/user/staff/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchUserById = async ({ id, data }) => {
  const response = await axios.put(`/api/v1/user/staff/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchUsersByRole = async (roleId) => {
  const response = await axios.get(`/api/v1/user/roles/${roleId}`);
  return response.data.data;
};
