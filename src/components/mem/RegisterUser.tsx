"use client";

import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GUID_VALID_EMAIL_DOMAIN,
  GUID_VALID_EMAIL_ID,
  GUID_VALID_ID,
  GUID_VALID_NAME,
  GUID_VALID_PASSWORD,
} from "@/constants/common/guidConstants";
import { IRegisterUserReqDto } from "@/interface/mem/interfaceMemUser";
import { registerUser } from "@/service/mem/apiMemUser";
import { validId, validPassword } from "@/utils/core/regexUtil";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

const RegisterUser = () => {
  /***************
   * 지역변수 선언부
   ***************/

  // 로딩
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 회원가입 요청 파라미터
  const [registerParams, setRegisterParams] = useState<IRegisterUserReqDto>({
    id: "",
    password: "",
    name: "",
    birth: 19970430,
    emailId: "",
    emailDomain: "",
  });

  // useRouter
  const router = useRouter();

  /***************
   * 함수 선언부
   ***************/

  /**
   * input의 onInput 이벤트 핸들러
   */
  const handleOnInputRegister = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e) {
      return;
    }

    const { id, value } = e.currentTarget;

    setRegisterParams((prev) => ({
      ...prev,
      [id]: value,
    }));

    // switch (e.currentTarget.id) {
    //   case "id": {
    //     break;
    //   }
    //   case "password": {
    //     break;
    //   }
    //   default:
    //     break;
    // }
  };

  /**
   * 이메일 도메인 select 이벤트 핸들러
   * @param {string} value 이메일도메인 value
   */
  const handleOnChangeEmailDomain = (value: string) => {
    setRegisterParams((prev) => ({
      ...prev,
      emailDomain: value,
    }));
  };

  /**
   * 회원가입 버튼 클릭 이벤트
   */
  const handleOnClickRegisterBtn = async () => {
    try {
      setIsLoading(true);

      // input 검증 이벤트 호출
      const validFormRes = validRegisterForm();
      // 검증걸림
      if (!validFormRes.rst) {
        let msg = "정보를 입력해 주세요.";
        switch (validFormRes.type) {
          case "id": {
            msg =
              GUID_VALID_ID; /* 6~12자리 영문 대/소문자, 숫자 아이디를 입력해 주세요. */
            document.getElementById("id")?.focus();
            break;
          }
          case "password": {
            msg =
              GUID_VALID_PASSWORD /* 8~20자리 영문, 숫자, 안전한 특수문자 각각 1개 이상 포함, 8-20자 패스워드를 입력해 주세요.\n(허용 특수문자: ! @ # $ % ^ & * _ + = -) */;
            document.getElementById("password")?.focus();
            break;
          }
          case "name": {
            msg = GUID_VALID_NAME; /* 이름을 입력해 주세요. */
            document.getElementById("name")?.focus();
            break;
          }
          case "emailId": {
            msg = GUID_VALID_EMAIL_ID; /* 이메일 아이디를 입력해 주세요. */
            document.getElementById("emailId")?.focus();
            break;
          }
          case "emailDomain": {
            msg = GUID_VALID_EMAIL_DOMAIN; /* 이메일 도메인을 입력해 주세요. */
            break;
          }
          default: {
            break;
          }
        }

        alert(msg);
        return;
      }

      const res = await registerUser(registerParams);

      if (!res) throw new Error("회원가입에 실패하였습니다");

      if (res.code !== 0) throw new Error("회원가입에 실패하였습니다");

      const data = res.data;

      if (data.succYn !== "Y") throw new Error("회원가입에 실패하였습니다");

      alert("회원가입 완료하였습니다");

      router.push("/mem/login");
    } catch (e) {
      alert(e);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 회원가입 input 검증
   * @returns
   */
  const validRegisterForm = (): { rst: boolean; type?: string } => {
    // 아이디 검증
    if (!validId(registerParams.id)) {
      return { type: "id", rst: false };
    }

    // 패스워드 검증
    if (!validPassword(registerParams.password)) {
      return { type: "password", rst: false };
    }

    // 이름 검증
    if (registerParams.name.length === 0) {
      return { type: "name", rst: false };
    }

    // 이메일 아이디 검증
    if (registerParams.emailId.length === 0) {
      return { type: "eamilId", rst: false };
    }

    // 이메일 도메인 검증
    if (registerParams.emailDomain.length === 0) {
      return { type: "emailDomain", rst: false };
    }

    return { rst: true };
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>회원가입을 해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="id">아이디</Label>
              <Input
                id="id"
                name="id"
                type="id"
                value={registerParams.id}
                onInput={handleOnInputRegister}
                placeholder={
                  GUID_VALID_ID
                } /* 6~12자리 영문 대/소문자, 숫자 아이디를 입력해 주세요. */
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={registerParams.password}
                onInput={handleOnInputRegister}
                placeholder={
                  GUID_VALID_PASSWORD
                } /* 8~20자리 영문 대/소문자, 숫자, 안전한 특수문자 각각 1개 이상 포함, 8-20자 패스워드를 입력해 주세요.\n(허용 특수문자: ! @ # $ % ^ & * _ + = -) */
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={registerParams.name}
                onInput={handleOnInputRegister}
                placeholder={GUID_VALID_NAME} /* 이름을 입력해 주세요. */
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emailId">이메일</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="emailId"
                  name="emailId"
                  type="email"
                  value={registerParams.emailId}
                  onInput={handleOnInputRegister}
                  placeholder={
                    GUID_VALID_EMAIL_ID
                  } /* 이메일 아이디를 입력해 주세요. */
                  required
                />
                <Select
                  onValueChange={handleOnChangeEmailDomain}
                  value={registerParams.emailDomain}
                  defaultValue=""
                >
                  <SelectTrigger
                    id="emailDomain"
                    name="emailDomain"
                    className="w-[180px]"
                  >
                    <SelectValue placeholder="도메인 입력" defaultValue={""} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>도메인</SelectLabel>
                      <SelectItem value="gmail.com">gmail.com</SelectItem>
                      <SelectItem value="naver.com">naver.com</SelectItem>
                      <SelectItem value="daum.net">daum.net</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            onClick={handleOnClickRegisterBtn}
            className="w-full"
          >
            회원가입
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default RegisterUser;
