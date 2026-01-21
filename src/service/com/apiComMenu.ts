import { TComMenuListSearchResDto } from '@/interface/com/interfaceComMenu';
import { fetchExtended } from '@/lib/fetchExtended';

/**
 * 공통 메뉴 리스트를 조회한다
 * @returns {Promise<TComMenuListSearchResDto>} 공통 메뉴 리스트 조회 결과
 */
export const apiSearchComMenuList = async (): Promise<TComMenuListSearchResDto> => {
  const res = await fetchExtended(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/com/searchComMenuList`,
    {
      cache: 'force-cache',
    }
  );

  return res.json();
};
