"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import Link from "next/link"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { Nav } from "@/lib/nav"
import { Gender } from "@/enum/gender"
import { Check, X, User, Phone, Mail, Users, Briefcase, Shield, Award, UserIcon, PencilIcon, LockIcon } from "lucide-react"
import { ProfileRawData, ProfileData } from "./profile_data"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Profile() {
  const [data, setData] = useState<ProfileData | null>()

  function fetchData() {
    fetchWithToken(SE.API_PROFILE)
      .then((response) => response as ProfileRawData)
      .then((data) => {
        if (!data.data) return
        setData({
          id: data.data.user.id,
          username: data.data.user.username,
          displayName: data.data.user.name,
          phone: data.data.user.phone,
          email: data.data.user.email,
          gender: {
            1: Gender.Male,
            2: Gender.Female,
          }[data.data.user.gender],
          role: data.data.user.role.name,
          activity: data.data.user.activity,
          department: data.data.user.department,
          position: data.data.user.position,
          workLevel: data.data.user.lvWork,
          safeLevel: data.data.user.lvSafe,
          avatar: data.data.user.avatar,
          signature: data.data.user.signature,
        })
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message)
      })
  }

  useEffect(fetchData, [])

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="personal-info" className="w-full">
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

      {data && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={`${process.env.NEXT_PUBLIC_API_URL}/${data.avatar}`} />
                  <AvatarFallback>{data.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{data.displayName}</h2>
                  <p className="text-muted-foreground">{data.position}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span className="font-medium">Giới tính:</span>
                  <span className="ml-2">{data.gender === Gender.Male ? "Nam" : "Nữ"}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  <span className="font-medium">Số điện thoại:</span>
                  <span className="ml-2">{data.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{data.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin công việc</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span className="font-medium">Phòng ban:</span>
                  <span className="ml-2">{data.department}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span className="font-medium">Vị trí:</span>
                  <span className="ml-2">{data.position}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  <span className="font-medium">Quyền / Vai trò:</span>
                  <span className="ml-2">{data.role}</span>
                </div>
                {data.workLevel && (
                  <div className="flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    <span className="font-medium">Bậc thợ:</span>
                    <span className="ml-2">{data.workLevel}</span>
                  </div>
                )}
                {data.safeLevel && (
                  <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    <span className="font-medium">Bậc an toàn:</span>
                    <span className="ml-2">{data.safeLevel}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label>Trạng thái</Label>
                <Badge variant={data.activity ? "default" : "destructive"}>
                  {data.activity ? (
                    <span className="flex items-center">
                      Hoạt động
                      <Check className="ml-1 h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Không hoạt động
                      <X className="ml-1 h-3 w-3" />
                    </span>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {data.signature && (
            <Card>
              <CardHeader>
                <CardTitle>Chữ ký</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="overflow-hidden rounded border">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${data.signature}`}
                      alt="Chữ ký"
                      width={200}
                      height={100}
                      className="object-contain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}