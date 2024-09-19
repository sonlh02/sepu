'use client'

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Link from "next/link"
import Image from "next/image"
import Moment from "moment"

import menubar from "@/lib/menu"
import { Nav } from "@/lib/nav"
import { UserWright } from "@/enum/user_wright"
import { InspectStatus } from "@/enum/doc_status"
import { InspectType } from "@/enum/inspect_type"
import { IconFullScreen } from "@/component/Icon"
import { InspectData } from "../../inspect_data"
import { fetchInspectData } from "../../fetch_inspect_data"
import UserDontAccessPage from "@/component/NotAllow"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

enum SheetTab {
  Info = "info",
  Image = "image",
  Error = "error",
  Result = "result",
}

type StatusBadgeConfig = {
  variant: "outline" | "secondary" | "default";
  label: string;
  className?: string;
};

export default function ViewDoc({ params }: { params: { id: string } }) {
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [data, setData] = useState<InspectData | null>()
  const [currentTab, setCurrentTab] = useState<SheetTab>(SheetTab.Info)

  useEffect(() => {
    if(menubar("inspectdoc")) {
      setUserWright(UserWright.Write)
    } else if(menubar("inspectdoc-view")) {
      setUserWright(UserWright.Read)
    } else {
      setUserWright(UserWright.None)
    }

    const id = Number(params.id) || 0
    fetchInspectData(id)
      .then((response) => setData(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }, [params])

  if (!userWright) return null

  if (userWright === UserWright.None) return <UserDontAccessPage />

  if (!data) return null

  const statusBadge: Record<InspectStatus, StatusBadgeConfig> = {
    [InspectStatus.Created]: { variant: "outline", label: "Phiếu mới", className: "" },
    [InspectStatus.Confirmed]: { variant: "secondary", label: "Đã nhận phiếu", className: "" },
    [InspectStatus.Ready]: { variant: "default", label: "Thiết bị sẵn sàng", className: "" },
    [InspectStatus.Submited]: { variant: "secondary", label: "Đã nộp phiếu", className: "" },
    [InspectStatus.Approved]: { variant: "outline", label: "Đang ký duyệt", className: "border-yellow-500 text-yellow-500" },
    [InspectStatus.Completed]: { variant: "outline", label: "Đã hoàn thành", className: "border-green-500 text-green-500" },
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-1 flex-col relative items-center gap-6 p-4 sm:p-8 max-w-7xl mx-auto"
    >
      <div className="w-full flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Thông tin phiếu kiểm tra {data.type === InspectType.Day ? "ngày" : "đêm"}
        </h1>
        <Badge 
          variant={statusBadge[data.status].variant}
          className={cn("text-lg py-1 px-3", statusBadge[data.status].className)}
        >
          {statusBadge[data.status].label}
        </Badge>
      </div>

      <Button variant="outline" size="lg" asChild className="self-end">
        <Link href={Nav.INSPECTDOC_PAGE}>
          <IconFullScreen className="mr-2 h-4 w-4" /> Quay lại
        </Link>
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Tuyến</Label>
              <Input value={`${data.powerline.name} (${data.powerline.code})`} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Từ cột</Label>
              <Input value={`${data.powerPoles.from.name} (${data.powerPoles.from.code})`} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Đến cột</Label>
              <Input value={`${data.powerPoles.to.name} (${data.powerPoles.to.code})`} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Ngày kiểm tra</Label>
              <Input value={Moment(data.date).format("DD-MM-YYYY")} readOnly />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Phương thức kiểm tra</Label>
              <Input value={data.inspectMethod} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {[InspectStatus.Submited, InspectStatus.Approved, InspectStatus.Completed].indexOf(data.status) > -1 && (
        <Card className="w-full">
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as SheetTab)} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Chi tiết kiểm tra</CardTitle>
                <TabsList>
                  <TabsTrigger value={SheetTab.Info}>Thông tin</TabsTrigger>
                  <TabsTrigger value={SheetTab.Image}>Ảnh</TabsTrigger>
                  <TabsTrigger value={SheetTab.Error}>Bất thường</TabsTrigger>
                  <TabsTrigger value={SheetTab.Result}>Kết quả</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value={SheetTab.Info}>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Nhân viên kiểm tra</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">TT</TableHead>
                            <TableHead>Họ và tên</TableHead>
                            <TableHead>Chức danh</TableHead>
                            <TableHead>Bậc thợ</TableHead>
                            <TableHead>Bậc AT</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.workers.map((worker, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{worker.name}</TableCell>
                              <TableCell>{worker.position || ''}</TableCell>
                              <TableCell>{worker.lvWork || ''}</TableCell>
                              <TableCell>{worker.lvSafe || ''}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Thiết bị</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Máy trạm</Label>
                          <Input value={data.workstations.map((workstation) => workstation.name).join(", ")} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>UAV</Label>
                          <Input value={data.flycams.map((flycam) => flycam.name).join(", ")} readOnly />
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Ký duyệt</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">TT</TableHead>
                            <TableHead>Họ và tên</TableHead>
                            <TableHead>Chức danh</TableHead>
                            <TableHead>Vị trí ký duyệt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.approvers.map((approver, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{approver.name}</TableCell>
                              <TableCell>{approver.position || ''}</TableCell>
                              <TableCell>{approver.represent || ''}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value={SheetTab.Image}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {data.images.map((image, index) => (
                    <motion.div
                      key={image}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <Image
                        className="object-cover w-full h-full"
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${image}`}
                        alt={image}
                        width={300}
                        height={300}
                      />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value={SheetTab.Error}>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-8">
                    {data.warnings.map((warning, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">Bất thường #{index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                              <Image
                                className="object-cover"
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${warning.image}`}
                                alt="Bất thường"
                                layout="fill"
                              />
                              <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => popupWindow(`${process.env.NEXT_PUBLIC_API_URL}/${warning.image}`)}
                              >
                                <IconFullScreen className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label>Cột</Label>
                              <Input value={warning.powerPole} readOnly />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Vĩ độ</Label>
                                <Input value={warning.latitude} readOnly />
                              </div>
                              <div className="space-y-2">
                                <Label>Kinh độ</Label>
                                <Input value={warning.longitude} readOnly />
                              </div>
                              <div className="space-y-2">
                                <Label>Cao độ</Label>
                                <Input value={warning.altitude} readOnly />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Mô tả bất thường</Label>
                              <Textarea value={warning.description} readOnly className="h-32" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value={SheetTab.Result}>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {data.results.map((result, index) => (
                      <motion.div
                        key={result.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <Label className="text-lg font-semibold">{result.title}</Label>
                        <Textarea value={result.body} readOnly className="h-32" />
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      )}
    </motion.div>
  )
}

function popupWindow(url: string) {
  if (typeof window === "undefined") return
  window.open(
    url,
    "_blank",
    "menubar=no,toolbar=no,location=no,directories=no,status=no,dependent"
  )
}