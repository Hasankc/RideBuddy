import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// Custom hooks for common queries
export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data } = await api.get('/api/swipes/profiles');
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data } = await api.get('/api/matches');
      return data;
    },
    refetchInterval: 1000 * 30, // 30 seconds
  });
};

export const useMessages = (matchId: string) => {
  return useInfiniteQuery({
    queryKey: ['messages', matchId],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/api/messages/${matchId}?page=${pageParam}`);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};