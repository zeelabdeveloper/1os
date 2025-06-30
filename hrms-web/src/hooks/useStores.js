import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';

const API_URL = '/api/v1/stores';

// Fetch all stores
export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return data;
    },
    onError: (error) => {
      toast.error(`Failed to fetch stores: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Create new store
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeData) => axios.post(API_URL, storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success('Store created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create store: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Update a store
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, storeData }) => axios.put(`${API_URL}/${id}`, storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success('Store updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update store: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Delete a store
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success('Store deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete store: ${error?.response?.data?.message || error.message}`);
    },
  });
}