'use client'

import { Dispatch, SetStateAction, useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Gender } from "@/enum/gender"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { ReferenceData, UserData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, User, Phone, Mail, Building2, Briefcase, Shield, Key } from "lucide-react"

export default function EditUserModal({
  data,
  setEditingData,
  fetchData,
  params,
  limit,
  currentPage,
  referenceData,
}: {
  data: UserData
  setEditingData: Dispatch<SetStateAction<UserData | null>>
  fetchData: Function
  params: any
  limit: number
  currentPage: number
  referenceData: ReferenceData
}) {
  const [formData, setFormData] = useState({
    name: data.displayName,
    usercode: data.usercode,
    phone: data.phone,
    email: data.email,
    gender: String({
      [Gender.Male]: 1,
      [Gender.Female]: 2,
    }[data.gender]),
    activity: data.activity,
    department: data.department,
    position: data.position,
    role: String(data.role.id),
    level: data.level === 1,
    workLevel: String(data.workLevel),
    safeLevel: String(data.safeLevel),
    password: '',
    confirmPassword: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function edit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const {
      name, usercode, phone, email, gender, activity, department, position,
      role, level, workLevel, safeLevel, password, confirmPassword
    } = formData

    fetchWithToken(
      `${SE.API_USER}/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          name,
          usercode,
          phone,
          email,
          password,
          re_password: confirmPassword,
          gender: gender === '0' ? null : Number(gender),
          role_id: Number(role),
          department,
          position,
          lv_work: workLevel === '0' ? null : Number(workLevel),
          lv_safe: safeLevel === '0' ? null : Number(safeLevel),
          activity,
          level: level ? 1 : 0
        }),
      }
    )
      .then((data) => {
        if (data.message) toast.success(data.message)
        setEditingData(null)
        fetchData(params, limit, currentPage)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  return (
    <Dialog open={!!data} onOpenChange={() => setEditingData(null)}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Sửa thông tin người dùng</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full px-6">
          <form onSubmit={edit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="work">Công việc</TabsTrigger>
                <TabsTrigger value="security">Bảo mật</TabsTrigger>
              </TabsList>
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>Nhập thông tin cá nhân của người dùng</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="name">Tên <span className="text-destructive">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="usercode">User code <span className="text-destructive">*</span></Label>
                        <Input
                          id="usercode"
                          name="usercode"
                          value={formData.usercode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="phone">Số điện thoại <span className="text-destructive">*</span></Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="gender">Giới tính</Label>
                        <Select
                          name="gender"
                          value={formData.gender}
                          onValueChange={(value) => handleSelectChange('gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Chọn giới tính</SelectItem>
                            <SelectItem value="1">Nam</SelectItem>
                            <SelectItem value="2">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="activity"
                          name="activity"
                          checked={formData.activity}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activity: checked as boolean }))}
                        />
                        <Label htmlFor="activity">Hoạt động</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="work">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin công việc</CardTitle>
                    <CardDescription>Cập nhật thông tin công việc của người dùng</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="department">Phòng ban / Đơn vị</Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="position">Vị trí</Label>
                        <Input
                          id="position"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="role">Quyền / Vai trò <span className="text-destructive">*</span></Label>
                        <Select
                          name="role"
                          value={formData.role}
                          onValueChange={(value) => handleSelectChange('role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quyền / vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Chọn quyền / vai trò</SelectItem>
                            {Object.entries(referenceData.roles).map(([roleId, roleName]) => (
                              <SelectItem key={roleId} value={roleId}>
                                {roleName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="level"
                          name="level"
                          checked={formData.level}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, level: checked as boolean }))}
                        />
                        <Label htmlFor="level">Hiển thị dữ liệu</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cấp bậc</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="workLevel">Bậc thợ</Label>
                          <Select
                            name="workLevel"
                            value={formData.workLevel}
                            onValueChange={(value) => handleSelectChange('workLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn bậc thợ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Chọn bậc thợ</SelectItem>
                              {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                                <SelectItem key={level} value={String(level)}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="safeLevel">Bậc an toàn</Label>
                          <Select
                            name="safeLevel"
                            value={formData.safeLevel}
                            onValueChange={(value) => handleSelectChange('safeLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn bậc an toàn" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Chọn bậc an toàn</SelectItem>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <SelectItem key={level} value={String(level)}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Bảo mật</CardTitle>
                    <CardDescription>Cập nhật mật khẩu người dùng</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Key className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="password">Mật khẩu mới</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Key className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <div className="mt-6 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingData(null)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}