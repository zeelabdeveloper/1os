import api from '../axiosConfig';

export const getNews = async () => {
  const response = await api.get('/api/v1/news');
  return response.data;
};

export const getNewsById = async (id) => {
  const response = await api.get(`/api/v1/news/${id}`);
  return response.data;
};

export const createNews = async (newsData) => {
  const response = await api.post('/api/v1/news', newsData);
  return response.data;
};

export const updateNews = async (id, newsData) => {
  const response = await api.put(`/api/v1/news/${id}`, newsData);
  return response.data;
};

export const deleteNews = async (id) => {
  console.log(id)
  const response = await api.delete(`/api/v1/news/${id}`);
  return response.data;
};