"use client";

import { IJwtPayLoad } from "@/interface/auth/interfaceJwt";
import { IApiResponse } from "@/interface/common/interfaceApiResponse";
import { apiIsLogin } from "@/service/auth/apiAuthLogin";
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

  const { data: isLoginData } = useQuery<IApiResponse<boolean>, Error, boolean>(
    {
      queryKey: ["isLogin"],
      queryFn: apiIsLogin,
      select: (res) => {
        if (res.code !== 0) return false;
        return res.data;
      },
      staleTime: 5 * 60 * 1000, // 5분
      refetchOnMount: "always", // 컴포넌트 마운트 시 항상 재조회
      refetchOnWindowFocus: true, // 탭 전환시 조회
    }
  );

  const user = useMemo(() => {
    return data;
  }, [data]);

  const isLogin = useMemo(() => {
    return isLoginData;
  }, [isLoginData]);

  const handleLoginBtnClick = () => {
    router.push("/mem/login");
  };

  return (
    <div>
      <>
        {isLogin ? <>로그인</> : <>비로그인</>}
        {user ? (
          <p>{user.userNo}</p>
        ) : (
          <button onClick={handleLoginBtnClick}>log in</button>
        )}
      </>
    </div>
  );
};

export default LoginUserHead;
