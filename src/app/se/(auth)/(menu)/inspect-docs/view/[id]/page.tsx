'use client'

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Link from "next/link"
import Image from "next/image"
import Moment from "moment"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

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
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Thông tin phiếu kiểm tra {data.type === InspectType.Day ? "ngày" : "đêm"}
        </h1>
        {statusBadge[data.status]}
        <Button variant="destructive" asChild>
          <Link href={Nav.INSPECTDOC_PAGE}>Quay lại</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue={SheetTab.Info} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value={SheetTab.Info}>Thông tin</TabsTrigger>
              <TabsTrigger value={SheetTab.Image}>Ảnh</TabsTrigger>
              <TabsTrigger value={SheetTab.Error}>Bất thường</TabsTrigger>
              <TabsTrigger value={SheetTab.Result}>Kết quả</TabsTrigger>
            </TabsList>
            <TabsContent value={SheetTab.Info}>
              <div className="grid gap-4 md:grid-cols-3">
                <InfoItem label="Tuyến" value={`${data.powerline.name} (${data.powerline.code})`} />
                <InfoItem label="Từ cột" value={`${data.powerPoles.from.name} (${data.powerPoles.from.code})`} />
                <InfoItem label="Đến cột" value={`${data.powerPoles.to.name} (${data.powerPoles.to.code})`} />
                <InfoItem label="Ngày kiểm tra" value={Moment(data.date).format("DD-MM-YYYY")} />
                <InfoItem label="Phương thức kiểm tra" value={data.inspectMethod} />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Nhân viên kiểm tra</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TT</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Chức danh</TableHead>
                      <TableHead>Bậc thợ</TableHead>
                      <TableHead>Bậc AT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.workers.map((worker, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{worker.name}</TableCell>
                        <TableCell>{worker.position || ''}</TableCell>
                        <TableCell>{worker.lvWork || ''}</TableCell>
                        <TableCell>{worker.lvSafe || ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Thiết bị</h3>
                <InfoItem label="Máy trạm" value={data.workstations.map((w) => w.name).join(", ")} />
                <InfoItem label="UAV" value={data.flycams.map((f) => f.name).join(", ")} />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Ký duyệt</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TT</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Chức danh</TableHead>
                      <TableHead>Vị trí ký duyệt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.approvers.map((approver, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{approver.name}</TableCell>
                        <TableCell>{approver.position || ''}</TableCell>
                        <TableCell>{approver.represent || ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value={SheetTab.Image}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${image}`}
                      alt={`Image ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value={SheetTab.Error}>
              <ScrollArea className="h-[600px]">
                {data.warnings.map((warning, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader>
                      <CardTitle>Bất thường #{index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative aspect-video">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${warning.image}`}
                            alt={`Warning ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
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
                          <InfoItem label="Cột" value={warning.powerPole} />
                          <InfoItem label="Vĩ độ" value={warning.latitude} />
                          <InfoItem label="Kinh độ" value={warning.longitude} />
                          <InfoItem label="Cao độ" value={warning.altitude} />
                          <InfoItem label="Mô tả bất thường" value={warning.description} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value={SheetTab.Result}>
              {data.results.map((result, index) => (
                <InfoItem key={index} label={result.title} value={result.body} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

function popupWindow(url: string) {
  if (typeof window === "undefined") return
  window.open(url, "_blank", "menubar=no,toolbar=no,location=no,directories=no,status=no,dependent")
}