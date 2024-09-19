"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from 'react-toastify'
import Image from "next/image"
import Link from "next/link"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { Nav } from "@/lib/nav"
import { ProfileRawData, ProfileData } from "../profile_data"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Phone, Mail, UserCircle2, UserIcon, PencilIcon, LockIcon } from "lucide-react"
import { Gender } from "@/enum/gender"

export default function ProfileEdit() {
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [gender, setGender] = useState<Gender | "">("")
  const [isLoading, setIsLoading] = useState(true)

  function fetchData() {
    setIsLoading(true)
    fetchWithToken(SE.API_PROFILE)
      .then((response) => {
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response from server')
        }
        return response as ProfileRawData
      })
      .then((data) => {
        if (!data.data || !data.data.user) {
          throw new Error('User data not found in response')
        }
        setData({
          id: data.data.user.id,
          username: data.data.user.username,
          displayName: data.data.user.name,
          phone: data.data.user.phone,
          email: data.data.user.email,
          gender: data.data.user.gender === 1 ? Gender.Male : Gender.Female,
          role: data.data.user.role?.name || '',
          activity: data.data.user.activity,
          department: data.data.user.department,
          position: data.data.user.position,
          workLevel: data.data.user.lvWork,
          safeLevel: data.data.user.lvSafe,
          avatar: data.data.user.avatar,
          signature: data.data.user.signature,
        })
        setGender(data.data.user.gender === 1 ? Gender.Male : Gender.Female)
      })
      .catch((e: Error) => {
        console.error('Error fetching profile data:', e)
        toast.error(e.message || 'An error occurred while fetching profile data')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function edit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (gender === "") formData.delete("gender")
    else formData.set("gender", gender === Gender.Male ? "1" : "2")

    fetchWithToken(SE.API_PROFILE, {
      method: "POST",
      headers: { "Content-Type": null },
      body: formData,
    })
      .then((data) => {
        if (data && data.message) {
          toast.success(data.message)
        } else {
          console.warn('No response message from server')
        }
        router.push(Nav.PROFILE_PAGE)
      })
      .catch((e: Error) => {
        console.error('Error updating profile:', e)
        toast.error(e.message || 'An error occurred while updating profile')
        router.push(Nav.PROFILE_PAGE)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!data) {
    return <div className="flex justify-center items-center h-screen">Failed to load profile data</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="update-info" className="w-full">
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
          <CardTitle className="text-2xl font-bold text-center">Cập nhật thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={edit} className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={data.avatar ? `${process.env.NEXT_PUBLIC_API_URL}/${data.avatar}` : ''} />
                <AvatarFallback>{data.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  <User className="w-4 h-4 inline-block mr-2" />
                  Tên
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={data.displayName || ''}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  defaultValue={data.email || ''}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  <Phone className="w-4 h-4 inline-block mr-2" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  defaultValue={data.phone || ''}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  <UserCircle2 className="w-4 h-4 inline-block mr-2" />
                  Giới tính
                </Label>
                <Select name="gender" value={gender} onValueChange={(value) => setGender(value as Gender)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Chọn giới tính</SelectItem>
                    <SelectItem value={Gender.Male}>Nam</SelectItem>
                    <SelectItem value={Gender.Female}>Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="text-sm font-medium">Avatar</Label>
                  <Input
                    id="avatar"
                    type="file"
                    name="avatar"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature" className="text-sm font-medium">Chữ ký</Label>
                  <Input
                    id="signature"
                    type="file"
                    name="signature"
                    className="w-full"
                  />
                </div>
              </div>

              {data.signature && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Chữ ký hiện tại</Label>
                  <div className="mt-2 h-24 overflow-hidden rounded bg-muted flex items-center justify-center">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${data.signature}`}
                      alt="Signature"
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: 'auto', height: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full">Cập nhật thông tin</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}