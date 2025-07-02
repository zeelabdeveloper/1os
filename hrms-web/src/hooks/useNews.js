import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from "../api/newsService";
import { fetchRoles } from "../api/auth";

export const useNews = () => {
  return useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });
};

export const useNewsById = (id) => {
  return useQuery({
    queryKey: ["news", id],
    queryFn: () => getNewsById(id),
    enabled: !!id,
  });
};

export const useCreateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      queryClient.invalidateQueries(["news"]);
      toast.success("News created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create news");
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["news"]);
      toast.success("News updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update news");
    },
  });
};

export const useDeleteNews = (sdx) => {
 const QueryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      QueryClient.invalidateQueries(["news"]);
      toast.success("News deleted successfully!");
    },
    onError: (error) => {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to delete news");
    },
  });
};
export const getUserRole = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryFn: fetchRoles,
    onSuccess: () => {
      queryClient.invalidateQueries(["news"]);
      toast.success("News deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete news");
    },
  });
};
