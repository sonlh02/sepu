'use client'

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Link from "next/link"
import Image from "next/image"
import Moment from "moment"
import { ArrowLeft, Calendar, MapPin, Users, Laptop, DrillIcon as Drone, FileCheck, ChevronRight } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import menubar from "@/lib/menu"
import { Nav } from "@/lib/nav"
import { UserWright } from "@/enum/user_wright"
import { InspectStatus } from "@/enum/doc_status"
import { InspectType } from "@/enum/inspect_type"
import { IconFullScreen } from "@/component/Icon"
import { InspectData } from "../../inspect_data"
import { fetchInspectData } from "../../fetch_inspect_data"
import UserDontAccessPage from "@/component/NotAllow"

enum SheetTab {
  Info = "info",
  Image = "image",
  Error = "error",
  Result = "result",
}

export default function ViewDoc({ params }: { params: { id: string } }) {
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [data, setData] = useState<InspectData | null>()
  const [currentTab, setCurrentTab] = useState<SheetTab>(SheetTab.Info)

  useEffect(() => {
    if (menubar("inspectdoc")) {
      setUserWright(UserWright.Write)
    } else if (menubar("inspectdoc-view")) {
      setUserWright(UserWright.Read)
    } else {
      setUserWright(UserWright.None)
    }

    const id = Number(params.id) || 0
    fetchInspectData(id)
      .then((response) => setData(response))
      .catch((e: Error) => {
        if (e.message) toast.error(e.message)
      })
  }, [params])

  if (!userWright) return null
  if (userWright === UserWright.None) return <UserDontAccessPage />
  if (!data) return null

  const statusBadge = {
    [InspectStatus.Created]: <Badge variant="outline">Phiếu mới</Badge>,
    [InspectStatus.Confirmed]: <Badge variant="secondary">Đã nhận phiếu</Badge>,
    [InspectStatus.Ready]: <Badge variant="default">Thiết bị sẵn sàng</Badge>,
    [InspectStatus.Submited]: <Badge variant="secondary">Đã nộp phiếu</Badge>,
    [InspectStatus.Approved]: <Badge variant="outline">Đang ký duyệt</Badge>,
    [InspectStatus.Completed]: <Badge variant="secondary">Đã hoàn thành</Badge>,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={Nav.INSPECTDOC_PAGE}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">
                  Thông tin phiếu kiểm tra {data.type === InspectType.Day ? "ngày" : "đêm"}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{Moment(data.date).format("DD/MM/YYYY")}</span>
                  {statusBadge[data.status]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue={SheetTab.Info} className="space-y-6">
          <TabsList className="bg-white p-1 inline-flex gap-1">
            <TabsTrigger value={SheetTab.Info} className="rounded-md">Thông tin</TabsTrigger>
            <TabsTrigger value={SheetTab.Image} className="rounded-md">Ảnh</TabsTrigger>
            <TabsTrigger value={SheetTab.Error} className="rounded-md">Bất thường</TabsTrigger>
            <TabsTrigger value={SheetTab.Result} className="rounded-md">Kết quả</TabsTrigger>
          </TabsList>

          <TabsContent value={SheetTab.Info}>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Thông tin tuyến
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem 
                    label="Tuyến" 
                    value={`${data.powerline.name} (${data.powerline.code})`}
                    className="pb-4 border-b"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem 
                      label="Từ cột" 
                      value={`${data.powerPoles.from.name} (${data.powerPoles.from.code})`} 
                    />
                    <InfoItem 
                      label="Đến cột" 
                      value={`${data.powerPoles.to.name} (${data.powerPoles.to.code})`}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Nhân viên kiểm tra
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">TT</TableHead>
                        <TableHead>Họ và tên</TableHead>
                        <TableHead>Chức danh</TableHead>
                        <TableHead className="text-center">Bậc</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.workers.map((worker, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{worker.name}</TableCell>
                          <TableCell>{worker.position || '—'}</TableCell>
                          <TableCell className="text-center">
                            {worker.lvWork ? `${worker.lvWork}/${worker.lvSafe}` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Laptop className="h-5 w-5" />
                    Thiết bị sử dụng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Laptop className="h-4 w-4" />
                      Máy trạm
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {data.workstations.map((w) => w.name).join(", ")}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Drone className="h-4 w-4" />
                      UAV
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {data.flycams.map((f) => f.name).join(", ")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Ký duyệt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">TT</TableHead>
                        <TableHead>Họ và tên</TableHead>
                        <TableHead>Chức danh</TableHead>
                        <TableHead>Vị trí</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.approvers.map((approver, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{approver.name}</TableCell>
                          <TableCell>{approver.position || '—'}</TableCell>
                          <TableCell>{approver.represent || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value={SheetTab.Image}>
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh kiểm tra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.images.map((image, index) => (
                    <div key={index} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${image}`}
                        alt={`Image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform group-hover:scale-105"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => popupWindow(`${process.env.NEXT_PUBLIC_API_URL}/${image}`)}
                      >
                        <IconFullScreen className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={SheetTab.Error}>
            <Card>
              <CardHeader>
                <CardTitle>Danh sách bất thường</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {data.warnings.map((warning, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Bất thường #{index + 1}</CardTitle>
                            <Badge variant="outline" className="font-normal">
                              Cột {warning.powerPole}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${warning.image}`}
                                alt={`Warning ${index + 1}`}
                                layout="fill"
                                objectFit="cover"
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
                            <div>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <InfoItem label="Vĩ độ" value={warning.latitude} />
                                <InfoItem label="Kinh độ" value={warning.longitude} />
                                <InfoItem label="Cao độ" value={warning.altitude} />
                              </div>
                              <InfoItem 
                                label="Mô tả bất thường" 
                                value={warning.description}
                                className="pt-4 border-t" 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={SheetTab.Result}>
            <Card>
              <CardHeader>
                <CardTitle>Kết quả kiểm tra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data.results.map((result, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-medium">{result.title}</h3>
                      <p className="text-sm text-
muted-foreground">{result.body}</p>
                      {index < data.results.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface InfoItemProps {
  label: string;
  value: string | number;
  className?: string;
}

function InfoItem({ label, value, className = "" }: InfoItemProps) {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function popupWindow(url: string) {
  if (typeof window === "undefined") return
  window.open(url, "_blank", "menubar=no,toolbar=no,location=no,directories=no,status=no,dependent")
}

