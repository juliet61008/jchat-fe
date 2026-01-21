// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분 (데이터 신선도)
            gcTime: 5 * 60 * 1000, // 5분 (캐시 유지 시간)
            refetchOnWindowFocus: false, // 창 포커스 시 자동 refetch 비활성화
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* <GlobalQueryCacheProviders> */}
      {children}
      {/* </GlobalQueryCacheProviders> */}
      {/*<ReactQueryDevtools initialIsOpen={false} />*/}
    </QueryClientProvider>
  );
};

export default Providers;
