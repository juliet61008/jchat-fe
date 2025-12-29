"use client";

import { IJwtPayLoad } from "@/interface/auth/interfaceJwt";
import { getUser } from "@/utils/mem/userUtil";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface Props {
  initialUser: IJwtPayLoad;
}

const LoginUserHead = (props: Props) => {
  const { initialUser } = props;

  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 5 * 60 * 1000, // 5분
    initialData: initialUser,
    refetchOnMount: "always", // 컴포넌트 마운트 시 항상 재조회
    refetchOnWindowFocus: true, // 탭 전환시 조회
  });

  const user = useMemo(() => {
    return data;
  }, [data]);

  const handleLoginBtnClick = () => {
    router.push("/mem/login");
  };

  return (
    <div>
      {user ? (
        <p>{user.userNo}</p>
      ) : (
        <button onClick={handleLoginBtnClick}>log in</button>
      )}
    </div>
  );
};

export default LoginUserHead;
