import MenuList from '@/components/com/MenuList';
import { getUser } from '@/utils/mem/userUtil';

/**
 * 메뉴 목록
 * @returns
 */

const page = async () => {
  const user = await getUser();

  return <MenuList user={user} />;
};

export default page;
