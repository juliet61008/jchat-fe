'use client';

import Loading from '@/components/common/Loading';
import { logoutServerAction } from '@/utils/auth/authUtil';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Logout = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const processing = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    // 쿠키 먼저 삭제 후 캐시 제거
    await logoutServerAction();

    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.removeQueries({ queryKey: ['isLogin'] });

    // Next.js RSC 캐시 초기화 후 이동
    router.refresh();
    router.replace(`/`);
  };

  useEffect(() => {
    processing();
  }, []);

  return <Loading isLoading={true} />;
};

export default Logout;
