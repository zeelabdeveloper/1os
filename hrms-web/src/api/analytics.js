import axios from "../axiosConfig";
export const fetchStaffAnalytics = async () => {
  const { data } = await axios.get("/api/v1/analytics/staff");
  return data;
};

export const fetchDashboardData = async () => {
  const { data } = await axios.get("/api/v1/analytics/dashboard");
  return data;
};

export const fetchBranchAnalytics = async () => {
  const { data } = await axios.get("/api/v1/analytics/branches");
  return data;
};
export const fetchSingleBranchAnalytics = async (branchID) => {
  const { data } = await axios.get(`/api/v1/analytics/branches/${branchID}`);
  return data;
};

export const fetchBankAnalytics = async () => {
  const { data } = await axios.get("/api/v1/analytics/bank");
  return data;
};

export const fetchDepartmentAnalytics = async () => {
  const { data } = await axios.get("/api/v1/analytics/departments");
  return data;
};

export const fetchAttendanceAnalytics = async (params) => {
  const { data } = await axios.get("/api/v1/analytics/attendance", { params });
  return data;
};
