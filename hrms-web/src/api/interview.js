// api/interview.js
import axios from "../axiosConfig";

export const fetchInterviewRounds = async () => {
  const { data } = await axios.get("/api/v1/jobs/interview/interviewRounds");
  return data;
};

export const addInterviewRound = async (formData) => {
  const { data } = await axios.post("/api/v1/jobs/interview/interviewRounds", formData);
  return data;
};

export const updateInterviewRound = async ({ id, ...values }) => {
  const { data } = await axios.put(
    `/api/v1/jobs/interview/interviewRounds/${id}`,
    values
  );
  return data;
};

export const deleteInterviewRound = async (id) => {
  const { data } = await axios.delete(`/api/v1/jobs/interview/interviewRounds/${id}`);
  return data;
};

export const fetchInterviewersByrole = async (roleID) => {
  const { data } = await axios.get(`/api/v1/user/roles/${roleID}`);
  
  return data?.data || [];
};
