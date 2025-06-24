import axios from "axios";

export const fetchsetting = async () => {
  const response = await axios.get("/api/v1/settings");
  return response.data;
};

export const updatesetting = async (formData) => {
  const response = await axios.put("/api/v1/settings", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchemailSettings = async () => {
  const response = await axios.get("/api/v1/email-settings");
  return response.data;
};

export const updateemailSettings = async (data) => {
  const response = await axios.put("/api/v1/email-settings", data);
  return response.data;
};

export const fetchEmailNotification = async () => {
  const response = await axios.get("/api/v1/email-notification-setting");
  console.log(response.data)
  return response.data;
};

export const updateEmailNotification = async (data) => {
  const response = await axios.put("/api/v1/email-notification-setting", data);
  return response.data;
};
