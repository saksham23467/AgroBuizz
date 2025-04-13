import { getQueryFn } from './queryClient';

// Helper function with default parameters for Admin Dashboard
export const getAdminQueryFn = () => {
  return getQueryFn({ on401: 'throw' });
};