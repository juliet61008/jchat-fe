import { IComMenuListSearchResDto } from "@/interface/com/interfaceComMenu";

/**
 * 공통 메뉴 리스트를 조회한다
 * @returns {Promise<IComMenuListSearchResDto>} 공통 메뉴 리스트 조회 결과
 */
export const searchComMenuList =
  async (): Promise<IComMenuListSearchResDto> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/com/searchComMenuList`
    );

    return res.json();
  };
