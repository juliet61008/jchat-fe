"use client";

import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IAuthLoginReqDto } from "@/interface/auth/interfaceAuthLogin";
import { loginServerAction } from "@/utils/auth/authUtil";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

const Login = () => {
  /***************
   * 지역변수 선언부
   ***************/

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // 로그인 form Ref
  const formRef = useRef<HTMLFormElement>(null);

  // useRouter
  const router = useRouter();

  /***************
   * 함수 선언부
   ***************/

  /**
   * 아이디/패스워드 인풋 onInput 이벤트
   * @param {React.ChangeEvent<HTMLInputElement>} e input 엘리멘트
   */
  const handleOnInputLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO 임시
    // checkAuth().then((data) => {
    //   console.log(
    //     "accessToken : " +
    //       data.accessToken +
    //       ", refreshToken : " +
    //       data.refreshToken
    //   );
    // });
    if (e) {
      switch (e.currentTarget.id) {
        case "id": {
          // setId(e.currentTarget.value);
          break;
        }
        case "password": {
          // setPassword(e.currentTarget.value);
          break;
        }
        default: {
          break;
        }
      }
    }
  };

  /**
   * 엔터 keydown 이벤트
   */
  const handlePasswordInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.code === "Enter") {
      handleLoginBtnClick();
    }
  };

  /**
   * 로그인 버튼 onClick 이벤트
   */
  const handleLoginBtnClick = async () => {
    setIsLoading(true);

    if (!formRef.current) {
      return;
    }
    const formData = new FormData(formRef.current);

    // name 속성으로 값 추출
    const id: string = formData.get("id") as string;
    const password: string = formData.get("password") as string;

    if (!id) {
      alert("아이디 입력");
      return;
    }

    if (!password) {
      alert("비밀번호 입력");
      return;
    }

    const getAuthLoginReqDto: IAuthLoginReqDto = {
      id: id,
      password: password,
    };

    // TODO 서버액션으로 변경중
    // const res = await getAuthLogin(getAuthLoginReqDto);
    const res = await loginServerAction(getAuthLoginReqDto);

    // 정상 인증
    if (res.code === 0) {
      // 로그인 성공 후 user 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["user"] });

      router.push("/");
    }
    // 아이디 조회 불가
    else if (res.code === -2) {
      alert("아이디 틀림");
      document.getElementById("id")?.focus();
    }
    // 비밀번호 틀림
    else if (res.code === -3) {
      alert("비번 틀림");
      document.getElementById("password")?.focus();
    }
    // 외
    else {
      alert("로그인 불가");
    }
    setIsLoading(false);
  };

  /**
   * Sign Up 버튼 이벤트
   */
  const handleSignUpBtnClick = () => {
    router.push("/mem/register");
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>로그인을 해주세요</CardDescription>
          <CardAction>
            <Button onClick={handleSignUpBtnClick} variant="link">
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form ref={formRef}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  name="id"
                  type="id"
                  //value={id}
                  onInput={handleOnInputLogin}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    비밀번호를 잊으셨나요?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  // value={password}
                  onInput={handleOnInputLogin}
                  onKeyDown={handlePasswordInputKeyDown}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            onClick={handleLoginBtnClick}
            className="w-full"
          >
            로그인
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default Login;
