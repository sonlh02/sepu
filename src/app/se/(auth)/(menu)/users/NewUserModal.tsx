'use client'

import { Dispatch, SetStateAction } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { ReferenceData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { X } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  usercode: z.string().min(1, "User code không được để trống"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  gender: z.string(),
  department: z.string(),
  position: z.string(),
  role: z.string().min(1, "Vui lòng chọn quyền / vai trò"),
  level: z.boolean(),
  activity: z.boolean(),
  workLevel: z.string(),
  safeLevel: z.string(),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
})

export default function NewUserModal({
  setIsNewModalShow,
  fetchData,
  params,
  limit,
  currentPage,
  referenceData,
}: {
  setIsNewModalShow: Dispatch<SetStateAction<boolean>>
  fetchData: Function
  params: any
  limit: number
  currentPage: number
  referenceData: ReferenceData
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      usercode: "",
      phone: "",
      email: "",
      gender: "0",
      department: "",
      position: "",
      role: "0",
      level: true,
      activity: true,
      workLevel: "0",
      safeLevel: "0",
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    fetchWithToken(SE.API_USER, {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        usercode: values.usercode,
        phone: values.phone,
        email: values.email,
        password: values.password,
        re_password: values.confirmPassword,
        gender: values.gender === "0" ? null : Number(values.gender),
        role_id: Number(values.role),
        department: values.department,
        position: values.position,
        lv_work: values.workLevel === "0" ? null : Number(values.workLevel),
        lv_safe: values.safeLevel === "0" ? null : Number(values.safeLevel),
        activity: values.activity,
        level: values.level ? 1 : 0,
      }),
    })
      .then((data) => {
        if (data.message) toast.success(data.message)
        setIsNewModalShow(false)
        fetchData(params, limit, currentPage)
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message)
      })
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && setIsNewModalShow(false)}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-black to-gray-500">
          <DialogTitle className="text-2xl font-bold text-white">Thêm người dùng</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-gray-300 focus:border-gray-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usercode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User code</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-gray-300 focus:border-gray-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} className="border-gray-300 focus:border-gray-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className="border-gray-300 focus:border-gray-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-gray-500">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">---- Chọn giới tính ----</SelectItem>
                        <SelectItem value="1">Nam</SelectItem>
                        <SelectItem value="2">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quyền / Vai trò</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-gray-500">
                          <SelectValue placeholder="Chọn quyền / vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">---- Chọn quyền / vai trò ----</SelectItem>
                        {Object.entries(referenceData.roles).map(([roleId, roleName]) => (
                          <SelectItem key={roleId} value={roleId}>
                            {roleName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phòng ban / Đơn vị</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-gray-300 focus:border-gray-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vị trí</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-gray-300 focus:border-gray-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Hiển thị dữ liệu
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Hoạt động
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Accordion type="single" collapsible className="border rounded-lg">
              <AccordionItem value="level">
                <AccordionTrigger className="px-4">Cấp bậc</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bậc thợ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-gray-500">
                                <SelectValue placeholder="Chọn bậc thợ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">---- Chọn bậc thợ ----</SelectItem>
                              {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                                <SelectItem key={level} value={level.toString()}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="safeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bậc an toàn</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-gray-500">
                                <SelectValue placeholder="Chọn bậc an toàn" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">---- Chọn bậc an toàn ----</SelectItem>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <SelectItem key={level} value={level.toString()}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible className="border rounded-lg">
              <AccordionItem value="password">
                <AccordionTrigger className="px-4">Mật khẩu</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="border-gray-300 focus:border-gray-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhập lại mật khẩu</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="border-gray-300 focus:border-gray-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button type="submit" className="bg-gradient-to-r from-black to-gray-500 text-white">
                Thêm người dùng
              </Button>
            </motion.div>
          </form>
        </Form>
        <button
          onClick={() => setIsNewModalShow(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  )
}