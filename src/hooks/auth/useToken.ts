import { ICheckAuthRes } from '@/interface/auth/interfaceJwt';
import { checkAuth, isTokenValid, tokenRefreshServerAction } from '@/utils/auth/authUtil';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

/**
 * 토큰 관련 커스텀훅
 * @param {boolean} isAutoRefresh 토큰자동갱신 on/off 기본값 true
 * @returns
 */

export const useToken = (isAutoRefresh: boolean = true) => {
  // 갱신 프로세싱중인지 체크
  const isProcessingRefreshRef = useRef<boolean>(false);

  const tokenDataRef = useRef<ICheckAuthRes | undefined>(undefined);

  const { data: tokenData, refetch: refetchTokenData } = useQuery<ICheckAuthRes>({
    queryKey: ['tokenData'],
    queryFn: checkAuth,
  });

  /**
   * 토큰 강제갱신
   * @returns
   */
  const refreshTokenData = async (): Promise<ICheckAuthRes | undefined> => {
    if (!tokenData) return undefined;
    try {
      // 갱신 프로세싱 설정
      isProcessingRefreshRef.current = true;
      await tokenRefreshServerAction(tokenData);
      const { data } = await refetchTokenData();
      return data;
    } catch {
      return undefined;
    } finally {
      // 갱신 프로세싱 설정
      isProcessingRefreshRef.current = false;
    }
  };

  /**
   * 렌더링방지 ref 최신화
   */
  useEffect(() => {
    tokenDataRef.current = tokenData;
  }, [tokenData]);

  /**
   * 자동갱신 프로세스
   */
  const autoRefreshProcess = async () => {};

  // 자동갱신 체크 위한 useEffect
  useEffect(() => {
    if (!tokenDataRef.current || !isAutoRefresh) return;

    // 토큰데이터 없는 경우 return
    if (!tokenDataRef.current) return;

    // 갱신체크 인터벌 초기화
    let interval: any;

    // 자동갱신
    if (isAutoRefresh) {
      interval = setInterval(async () => {
        if (!tokenDataRef.current) return;
        if (isProcessingRefreshRef.current) {
          return;
        }

        try {
          // 갱신 프로세싱 설정
          isProcessingRefreshRef.current = true;
          // true: 검증통과 false: 갱신필요
          const isValid: boolean = await isTokenValid(tokenDataRef.current.accessToken ?? '');

          // 갱신필요
          if (!isValid) {
            await tokenRefreshServerAction(tokenData);
            await refetchTokenData();
          }
        } catch (e) {
          console.error('실패', e);
        } finally {
          // 갱신 프로세싱 종료
          isProcessingRefreshRef.current = false;
        }
      }, 1000);
    }

    // 클린업
    return () => {
      // 인터벌 undefined 아닌 경우
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoRefresh, refetchTokenData]);

  return { tokenData, refreshTokenData };
};
