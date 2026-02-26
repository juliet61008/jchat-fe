'use client';

import Loading from '@/components/common/Loading';
import { logoutServerAction } from '@/utils/auth/authUtil';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

const Logout = () => {
  const queryClient = useQueryClient();
  const hasProcessed = useRef(false);

  const processing = async () => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    await fetch(`${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    await logoutServerAction();

    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.removeQueries({ queryKey: ['isLogin'] });

    window.location.replace('/');
  };

  useEffect(() => {
    processing();
  }, []);

  return <Loading isLoading={true} />;
};

export default Logout;
