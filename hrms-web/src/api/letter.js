import axios from "../axiosConfig";
export const getLetterTemp = async () => {
  const { data } = await axios.get("/api/v1/manage-letter");
  return data.data;
};
