import axios from "axios";




const axiosInstance = axios.create({
  baseURL: "https://oneos-3.onrender.com",
  // baseURL: "http://localhost:5000",
  withCredentials: true, 
});

export default axiosInstance;
