'use client'

import { useState } from "react"
import { toast } from "react-toastify"
import Link from "next/link"
import { LockIcon, UserIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { Nav } from "@/lib/nav"

export default function ProfilePassword() {
  const [isLoading, setIsLoading] = useState(false)

  async function changePassword(formData: FormData) {
    setIsLoading(true)
    const currentPassword = formData.get("currentPassword")?.toString() || ""
    const newPassword = formData.get("newPassword")?.toString() || ""
    const confirmPassword = formData.get("confirmPassword")?.toString() || ""

    try {
      const data = await fetchWithToken(SE.API_PASSWORD, {
        method: "POST",
        body: JSON.stringify({
          curr_password: currentPassword,
          new_password: newPassword,
          re_password: confirmPassword,
        }),
      })

      if (data.message) {
        toast.success(data.message)
      }
    } catch (e) {
      if (e instanceof Error && e.message) {
        toast.error(e.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="change-password" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="personal-info" asChild>
            <Link href={Nav.PROFILE_PAGE} className="flex items-center justify-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>Thông tin cá nhân</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="update-info" asChild>
            <Link href={Nav.PROFILE_EDIT_PAGE} className="flex items-center justify-center gap-2">
              <PencilIcon className="w-4 h-4" />
              <span>Cập nhật thông tin</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="change-password" asChild>
            <Link href={Nav.PROFILE_PASSWORD_PAGE} className="flex items-center justify-center gap-2">
              <LockIcon className="w-4 h-4" />
              <span>Đổi mật khẩu</span>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" action={changePassword}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                name="currentPassword"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}