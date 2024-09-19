"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchWithBA } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { saveToken } from "@/lib/cookie";
import { getCookie } from "cookies-next";
import { Nav } from "@/lib/nav";
import { toast } from "react-toastify";

export default function Component() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function signIn() {
    fetchWithBA(SE.API_ACCESSTOKEN, {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((data) => {
        // save token
        saveToken(data);

        const menuItems: Array<string> = getCookie("menu")?.split(",") || [];
        if (
          (menuItems.length == 1 && menuItems[0] == "FULL")
        ) {
          router.push(Nav.DASHBOARD_PAGE);
        } else {
          router.push(Nav.DASHBOARD_PAGE);
        }
        console.log(username, password);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-center">
            Đăng nhập vào tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signIn}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone">Email hoặc Số điện thoại</Label>
                <Input
                  id="emailOrPhone"
                  name="username"
                  placeholder="Enter your email or phone number"
                  type="text"
                  required
                  aria-describedby="emailOrPhoneHint"
                  onChange={(event) => setUsername(event.target.value)}
                />
                {/* <p
                  id="emailOrPhoneHint"
                  className="text-sm text-muted-foreground"
                >
                  Nhập địa chỉ email hoặc số điện thoại của bạn (ví dụ: 0123456789)
                </p> */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  required
                  aria-describedby="passwordHint"
                  onChange={(event) => setPassword(event.target.value)}
                />
                {/* <p id="passwordHint" className="text-sm text-muted-foreground">
                  Nhập mật khẩu tài khoản của bạn
                </p> */}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Nhớ mật khẩu
                </label>
              </div>
            </div>
            <Button className="w-full mt-5" type="submit">
              Đăng nhập
            </Button>
          </form>
        </CardContent>
        {/* <CardFooter className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 text-sm text-center">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
            <Link href="/signup" className="text-primary hover:underline">
              Don't have an account? Sign up
            </Link>
          </div>
        </CardFooter> */}
      </Card>
    </div>
  );
}
