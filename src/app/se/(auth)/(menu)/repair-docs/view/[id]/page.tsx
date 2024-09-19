'use client'

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Link from "next/link"
import Image from "next/image"
import Moment from "moment"

import menubar from "@/lib/menu"
import { Nav } from "@/lib/nav"
import { UserWright } from "@/enum/user_wright"
import { RepairStatus } from "@/enum/doc_status"
import { RepairData } from "../../repair_data"
import { fetchRepairData } from "../../fetch_repair_data"
import UserDontAccessPage from "@/component/NotAllow"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Users, ShieldCheck, Clipboard, FileCheck } from "lucide-react"

enum SheetTab {
  Info = "info",
  Image = "image",
  Result = "result",
}

export default function ViewDoc({ params }: { params: { id: string } }) {
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [data, setData] = useState<RepairData | null>()
  const [currentTab, setCurrentTab] = useState<SheetTab>(SheetTab.Info)

  useEffect(() => {
    if(menubar("repairdoc")) {
      setUserWright(UserWright.Write)
    } else if(menubar("repairdoc-view")) {
      setUserWright(UserWright.Read)
    } else {
      setUserWright(UserWright.None)
    }

    const id = Number(params.id) || 0
    fetchRepairData(id)
      .then((response) => setData(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }, [params])

  if (!userWright) return null
  if (userWright === UserWright.None) return <UserDontAccessPage />
  if (!data) return null

  const statusBadge = {
    [RepairStatus.Created]: <Badge variant="outline">Phiếu mới</Badge>,
    [RepairStatus.Confirmed]: <Badge variant="secondary">Đã nhận phiếu</Badge>,
    [RepairStatus.Submited]: <Badge variant="default">Đã nộp phiếu</Badge>,
    [RepairStatus.Approved]: <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Đang ký duyệt</Badge>,
    [RepairStatus.Completed]: <Badge variant="default" className="bg-green-500 hover:bg-green-600">Đã hoàn thành</Badge>,
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-4">
          Thông tin phiếu sửa chữa
          {statusBadge[data.status]}
        </h1>
        <Button variant="outline" asChild>
          <Link href={Nav.REPAIRDOC_PAGE}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium leading-none">Ngày sửa chữa</Label>
                <p className="text-sm text-muted-foreground">{Moment(data.date).format("DD-MM-YYYY")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium leading-none">Tuyến</Label>
                <p className="text-sm text-muted-foreground">{data.powerline.name} ({data.powerline.code})</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as SheetTab)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value={SheetTab.Info}>Thông tin</TabsTrigger>
          <TabsTrigger value={SheetTab.Image}>Ảnh</TabsTrigger>
          <TabsTrigger value={SheetTab.Result}>Kết quả</TabsTrigger>
        </TabsList>
        <TabsContent value={SheetTab.Info}>
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết phiếu sửa chữa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Users className="mr-2 h-5 w-5" /> Nhân viên sửa chữa
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">TT</TableHead>
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
                        <TableCell className="font-medium">{worker.name}</TableCell>
                        <TableCell>{worker.position || ''}</TableCell>
                        <TableCell>{worker.workLevel || ''}</TableCell>
                        <TableCell>{worker.safeLevel || ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5" /> Biện pháp an toàn
                </h3>
                <p className="text-sm text-muted-foreground">{data.prepare}</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Clipboard className="mr-2 h-5 w-5" /> Nhiệm vụ sửa chữa
                </h3>
                <p className="text-sm text-muted-foreground">{data.tasks}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FileCheck className="mr-2 h-5 w-5" /> Ký duyệt
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">TT</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Chức danh</TableHead>
                      <TableHead>Vị trí ký duyệt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.approvers.map((approver, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{approver.name}</TableCell>
                        <TableCell>{approver.position || ''}</TableCell>
                        <TableCell>{approver.represent || ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={SheetTab.Image}>
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {data.images.map((image) => (
                  <div key={image} className="aspect-square overflow-hidden rounded-md">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${image}`}
                      alt={image}
                      width={300}
                      height={300}
                      className="object-cover transition-all hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={SheetTab.Result}>
          <Card>
            <CardHeader>
              <CardTitle>Kết quả</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chưa có kết quả.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}