import axios from "../axiosConfig";

export const createIndicator = async (data) => {
  const res = await axios.post("/api/v1/performance/indicators", data);
  return res.data;
};

export const fetchIndicators = async () => {
  const res = await axios.get("/api/v1/performance/indicators");
  console.log(res.data);
  return res.data.data;
};

export const updateIndicator = async (id, data) => {
  console.log(id, data);
  const res = await axios.put(`/api/v1/performance/indicators/${id}`, data);
  return res.data;
};
export const deleteIndicator = async (id) => {
  const res = await axios.delete(`/api/v1/performance/indicators/${id}`);
  return res.data;
};

// Goals API
export const fetchGoals = async () => {
  const response = await axios.get(`/api/v1/performance/goals`);
  return response.data.data;
};

export const createGoal = async (goalData) => {
  const response = await axios.post(`/api/v1/performance/goals`, goalData);
  return response.data;
};

export const updateGoal = async (id, data) => {
  const response = await axios.put(`/api/v1/performance/goals/${id}`, data);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await axios.delete(`/api/v1/performance/goals/${id}`);
  return response.data;
};

export const fetchAppraisals = async (filters = {}) => {
  const { status, year, month } = filters;
  let query = {};

  if (status) query.status = status;
  if (year) query.year = year;
  if (month) query.month = month;

  const response = await axios.get("/api/v1/performance/appraisals", { params: query });
  return response.data.data;
};

export const createAppraisal = async (data) => {
  const response = await axios.post("/api/v1/performance/appraisals", data);
  return response.data;
};

export const updateAppraisal = async (id, data ) => {
  const response = await axios.put(`/api/v1/performance/appraisals/${id}`, data);
  return response.data;
};

export const deleteAppraisal = async (id) => {
  const response = await axios.delete(`/api/v1/performance/appraisals/${id}`);
  return response.data;
};

export const submitAppraisal = async (id) => {
  const response = await axios.post(`/api/v1/performance/appraisals/${id}/submit`);
  return response.data;
};



// api/auth.js
export const fetchUserById = async (userId) => {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data.data;
};
export const exportAppraisalsToPDF = async (userId) => {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data.data;
};
