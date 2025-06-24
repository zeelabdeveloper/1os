import axios from "axios";

export const createJob = async (data) => {
  const { dat } = await axios.post("/api/v1/jobs", data);
  return dat;
};

export const fetchJobs = async () => {
  const response = await axios.get("/api/v1/jobs");
  console.log(response.data);
  return response?.data?.data || [];
};
export const fetchJobList = async () => {
  const response = await axios.get("/api/v1/jobs");

  return response?.data;
};

export const updateJob = async (jobData) => {
  const response = await axios.put(`/api/v1/jobs/${jobData._id}`, jobData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await axios.delete(`/api/v1/jobs/${jobId}`);
  return response.data;
};

export const fetchJobStats = async () => {
  const response = await axios.get("/api/v1/jobs/stats/all");
  console.log(response.data.data);
  return response.data.data;
};

export const fetchApplications = async (jobId, dateFilter) => {
  try {
    const response = await axios.get(
      `/api/v1/jobs/applications/status?dateFilter=${dateFilter}& jobId=${jobId}`
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};
export const fetchHiredApplications = async () => {
 
    const response = await axios.get(
      `/api/v1/jobs/application/hired/all`
    );
    console.log(response.data);
    return response.data;

};

export const updateApplicationStatus = async ({ id, status }) => {
  const response = await axios.patch(`/api/v1/jobs/application/${id}/status`, {
    status,
  });
  return response.data;
};
export const initiateOnboarding = async (data) => {
  const response = await axios.post("/api/v1/recruitment/onboarding", data);
  return response.data;
};

export const fetchApplicationById = async (id) => {
  console.log(id);
  const response = await axios.get(`/api/v1/jobs/application/${id}`);
  return response.data;
};
export const deleteApplicationStatus = async (id) => {
  const response = await axios.delete(`/api/v1/jobs/application/${id}/status`);
  return response.data;
};

export const submitJobApplication = async (formData) => {
  console.log(...formData);
  const response = await axios.post("/api/v1/jobs/applications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchOnboardings = async () => {
  const response = await axios.get("/api/v1/onboarding");

  return response.data;
};

export const deleteOnboarding = (id) => {
  return axios.delete(`/api/v1/onboarding/${id}`);
};

export const convertToEmployee = (id) => {
  return axios.post(`/api/v1/onboarding/${id}/convert`);
};











