import { cacheMenus } from '@/lib/com/menu';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

const GlobalQueryCacheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  queryClient.prefetchQuery({
    queryKey: ['menus'],
    queryFn: async () => await cacheMenus(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
};

export default GlobalQueryCacheProviders;
