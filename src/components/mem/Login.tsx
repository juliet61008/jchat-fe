"use client";

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
import React, { useEffect, useRef, useState } from "react";

const testFunc = () => {
  const testArr = [1, 2, 3];
};

const Login = () => {
  /**
   * 지역변수 선언부
   */
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const formRef = useRef<HTMLFormElement>(null);

  /**
   * 아이디/패스워드 인풋 onInput 이벤트
   * @param {React.ChangeEvent<HTMLInputElement>} e input 엘리멘트
   */
  const handleOnInputLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      switch (e.currentTarget.id) {
        case "id": {
          setId(e.currentTarget.value);
          break;
        }
        case "password": {
          setPassword(e.currentTarget.value);
          break;
        }
        default: {
          break;
        }
      }
    }
  };
  console.log("All env vars:", process.env);
  console.log("API URL:", process.env.NEXT_PUBLIC_JCHAT_API_URL);
  console.log("API URL:", process.env.NEXT_PUBLIC_JCHAT_API_URL);
  /**
   * 로그인 버튼 onClick 이벤트
   */
  const handleOnClickLoginBtn = () => {
    console.log("API URL:", process.env.NEXT_PUBLIC_JCHAT_API_URL);
    console.log(`${process.env.NEXT_PUBLIC_JCHAT_API_URL}`);
    console.log(`id: ${id}, password: ${password}`);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form ref={formRef}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                type="id"
                value={id}
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
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onInput={handleOnInputLogin}
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          onClick={handleOnClickLoginBtn}
          className="w-full"
        >
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Login;
