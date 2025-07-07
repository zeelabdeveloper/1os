import axios from "axios";




const axiosInstance = axios.create({
  // baseURL: "https://oneos-3.onrender.com",
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, 
});

export default axiosInstance;
