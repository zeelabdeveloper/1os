import axios from "../axiosConfig";

export const userCheckIn = async (values) => {
  console.log(values);
  const response = await axios.post("/api/v1/attendance/checkin", {
    userId: values._id,
    location: values.location,
    checkInTime: values.checkInTime,
    remarks: values.remarks,
  });
  return response.data;
};
export const userCheckOut = async (values) => {
  const response = await axios.post("/api/v1/attendance/checkout", {
    userId: values._id,
    location: values.location,
    checkOutTime: values.checkOutTime,
    remarks: values.remarks,
  });
  return response.data;
};
export const fetchTodayAttendance = async (user) => {
  const response = await axios.get(
    `/api/v1/attendance/today?userId=${user._id}`
  );
  return response.data;
};
export const monthlyUserAttendance = async ({userId, selectedDate}) => {
  console.log(userId);
  const response = await axios.get(
    `/api/v1/attendance/monthly?userId=${userId}&month=${selectedDate.format(
      "YYYY-MM"
    )}`
  );
  console.log( response.data)
  return response.data?.data;
};
