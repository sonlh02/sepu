"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Link from "next/link"
import Moment from "moment"
import * as XLSX from 'xlsx'

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import menubar from "@/lib/menu"
import { Nav } from "@/lib/nav"

import { UserWright } from "@/enum/user_wright"
import { InspectStatus } from "@/enum/doc_status"
import { InspectType } from "@/enum/inspect_type"

import { Search, Plus, Edit, Trash2, Eye, Printer, FileSpreadsheet } from "lucide-react"

import { InspectData } from "./inspect_data"

import UserDontAccessPage from "@/component/NotAllow"
import Pagination from "@/app/se/(auth)/Pagination"
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

type InspectsRawData = {
  data: {
    total: number;
    page: number;
    inspect_docs: Array<{
      id: number;
      docNo: string;
      type: "D" | "N";
      dateInspect: string;
      route: {
        id: number;
        name: string;
        code: string;
      };
      powerFi: {
        id: number;
        name: string;
        code: string;
        latitude: number;
        longitude: number;
      };
      powerTi: {
        id: number;
        name: string;
        code: string;
        latitude: number;
        longitude: number;
      };
      routeCode: string;
      powerFrom: string;
      powerTo: string;
      methodInspect: string;
      status: 1 | 2 | 3 | 4 | 5 | 6;
      inspectTeams: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7;
        lvSafe: 1 | 2 | 3 | 4 | 5;
        leader?: boolean;
        signature?: string;
      }>;
      inspectApprovals: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        represent: string;
        signature: string;
        confirm?: boolean;
      }>;
      inspectWorkstations: Array<{
        id: number;
        workstation: {
          id: number;
          name: string;
          code: string;
          activity: boolean;
        };
      }>;
      inspectFlycams: Array<{
        id: number;
        flycam: {
          id: number;
          name: string;
          code: string;
          activity: boolean;
        };
      }>;
      inspectImages: Array<{
        id: number;
        visualData: {
          id: number;
          path: string;
          image: string;
        };
      }>;
      incidentFlies: Array<{
        id: number;
        power: {
          id: number;
          name: string;
          code: string;
          latitude: number;
          longitude: number;
        };
        pole?: string;
        line?: string;
        latitude: number;
        longitude: number;
        altitude: number;
        incident: string;
        incidentType: string;
        dateWarning: string;
        lvWarning: null;
        visualData: {
          id: number;
          path: string;
          image: string;
        };
      }>;
      inspectResults: Array<{
        id: number;
        keyword: string;
        title: string;
        result: string;
        pos: number;
      }>;
      workstation: string;
      flycam: string;
    }>;
  };
  message: string;
};

export default function InspectDocs() {
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [deletingData, setDeletingData] = useState<InspectData | null>(null)
  const [inspects, setInspects] = useState<Array<InspectData>>([])

  const [params, setParams] = useState({})
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  const exportExcel = () => {
    fetchWithToken(`${SE.API_INSPECTDOCREPORT}?${new URLSearchParams(params)}`)
      .then((data) => {
        const worksheet = XLSX.utils.json_to_sheet(data.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Phiếu kiểm tra");
        XLSX.writeFile(workbook, `DanhSachPhieuKiemTra_${Moment(new Date()).format("DD-MM-YYYY")}.xlsx`);
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }

  function fetchData(params: any, limit: number, page: number) {
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(
      `${SE.API_INSPECTDOCS}?${new URLSearchParams(params)}`
    )
      .then((response) => response as InspectsRawData)
      .then((data) => {
        if (!data.data) return;

        setInspects(
          data.data.inspect_docs.map((inspectRawData) => ({
            id: inspectRawData.id,
            type: {
              D: InspectType.Day,
              N: InspectType.Night,
            }[inspectRawData.type],
            powerline: {
              id: inspectRawData.route.id,
              name: inspectRawData.route.name,
              code: inspectRawData.route.code,
            },
            powerPoles: {
              from: {
                id: inspectRawData.powerFi.id,
                name: inspectRawData.powerFi.name,
                code: inspectRawData.powerFi.code,
              },
              to: {
                id: inspectRawData.powerTi.id,
                name: inspectRawData.powerTi.name,
                code: inspectRawData.powerTi.code,
              },
            },
            code: inspectRawData.docNo,
            date: new Date(inspectRawData.dateInspect),
            inspectMethod: inspectRawData.methodInspect,
            approvers: inspectRawData.inspectApprovals.map((approverRaw) => ({
              id: approverRaw.id,
              username: approverRaw.username,
              name: approverRaw.name,
              position: approverRaw.position,
              signature: approverRaw.signature,
              represent: approverRaw.represent,
            })),
            workers: inspectRawData.inspectTeams.map((workerRaw) => ({
              id: workerRaw.id,
              username: workerRaw.username,
              name: workerRaw.name,
              position: workerRaw.position,
              lvWork: workerRaw.lvWork,
              lvSafe: workerRaw.lvSafe,
              signature: workerRaw.signature,
              leader: workerRaw.leader,
            })),
            workstations: inspectRawData.inspectWorkstations.map((iw) => ({
              id: iw.workstation.id,
              name: iw.workstation.name,
              code: iw.workstation.code,
              activity: iw.workstation.activity,
            })),
            flycams: inspectRawData.inspectFlycams.map((iu) => ({
              id: iu.flycam.id,
              name: iu.flycam.name,
              code: iu.flycam.code,
              activity: iu.flycam.activity,
            })),
            status: {
              1: InspectStatus.Created,
              2: InspectStatus.Confirmed,
              3: InspectStatus.Ready,
              4: InspectStatus.Submited,
              5: InspectStatus.Approved,
              6: InspectStatus.Completed,
            }[inspectRawData.status],
            images: inspectRawData.inspectImages.map(
              (imageRaw) => imageRaw.visualData.path
            ),
            warnings: inspectRawData.incidentFlies.map((warningRaw) => ({
              image: warningRaw.visualData.path,
              powerPole: warningRaw.power.name,
              latitude: warningRaw.latitude,
              longitude: warningRaw.longitude,
              altitude: warningRaw.altitude,
              description: warningRaw.incident,
            })),
            results: inspectRawData.inspectResults.map((resultRaw) => ({
              title: resultRaw.title,
              body: resultRaw.result,
              keyword: resultRaw.keyword,
            })),
          }))
        );

        setTotal(data.data.total);
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if(menubar("inspectdoc")) {
      setUserWright(UserWright.Write)
      fetchData(params, limit, currentPage)
    } else if(menubar("inspectdoc-view")) {
      setUserWright(UserWright.Read)
      fetchData(params, limit, currentPage)
    } else {
      setUserWright(UserWright.None)
    }
  }, [params, limit, currentPage])

  if (!userWright) return null
  if (userWright === UserWright.None) return <UserDontAccessPage />

  function search(formData: FormData) {
    setParams(Object.fromEntries(formData))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Danh sách phiếu kiểm tra</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); search(new FormData(e.currentTarget)) }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày bắt đầu</label>
              <Input type="date" name="dateInspect" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày kết thúc</label>
              <Input type="date" name="dateInspect_end" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại phiếu</label>
              <Select name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phiếu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="D">Phiếu ngày</SelectItem>
                  <SelectItem value="N">Phiếu đêm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã tuyến</label>
              <Input name="route_code" placeholder="Nhập mã tuyến" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select name="status">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="1">Phiếu mới</SelectItem>
                  <SelectItem value="2">Đã nhận phiếu</SelectItem>
                  <SelectItem value="3">Thiết bị sẵn sàng</SelectItem>
                  <SelectItem value="4">Đã nộp phiếu</SelectItem>
                  <SelectItem value="5">Đang ký duyệt</SelectItem>
                  <SelectItem value="6">Đã hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Button>
        </form>

        <Separator className="my-6" />

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button onClick={exportExcel} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Xuất báo cáo
            </Button>
            <span className="text-sm text-muted-foreground">Tổng: {total}</span>
          </div>

          {userWright === UserWright.Write && (
            <div className="space-x-2">
              <Button asChild variant="outline">
                <Link href={Nav.INSPECTDOC_DAY_PAGE}>
                  <Plus className="mr-2 h-4 w-4" /> Tạo phiếu ngày
                </Link>
              </Button>
              <Button asChild>
                <Link href={Nav.INSPECTDOC_NIGHT_PAGE}>
                  <Plus className="mr-2 h-4 w-4" /> Tạo phiếu đêm
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Loại phiếu</TableHead>
                <TableHead>Ngày kiểm tra</TableHead>
                <TableHead>Đội kiểm tra</TableHead>
                <TableHead>PTKT</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspects.map((inspect, index) => (
                <TableRow key={inspect.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{inspect.code}</div>
                    <div className="text-sm text-muted-foreground">
                      Tuyến: {inspect.powerline.code} ({inspect.powerline.name})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Từ cột: {inspect.powerPoles.from.code} đến {inspect.powerPoles.to.code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={inspect.type === InspectType.Day ? "secondary" : "default"}>
                      {inspect.type === InspectType.Day ? "Phiếu ngày" : "Phiếu đêm"}
                    </Badge>
                  </TableCell>
                  <TableCell>{Moment(inspect.date).format("DD-MM-YYYY")}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {inspect.workers.map((worker, index) => (
                        <li key={index} className="text-sm">{worker.name}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{inspect.inspectMethod}</TableCell>
                  <TableCell>
                  <Badge 
                    variant={
                      inspect.status === InspectStatus.Created ? "default" :
                      inspect.status === InspectStatus.Confirmed ? "secondary" :
                      inspect.status === InspectStatus.Ready ? "outline" :
                      inspect.status === InspectStatus.Submited ? "secondary" :
                      inspect.status === InspectStatus.Approved ? "destructive" :
                      "default"
                    }
                    className={
                      inspect.status === InspectStatus.Created ? "bg-gray-100 text-gray-800" :
                      inspect.status === InspectStatus.Confirmed ? "bg-blue-100 text-blue-800" :
                      inspect.status === InspectStatus.Ready ? "bg-cyan-100 text-cyan-800" :
                      inspect.status === InspectStatus.Submited ? "bg-yellow-100 text-yellow-800" :
                      inspect.status === InspectStatus.Approved ? "bg-red-100 text-red-800" :
                      "bg-green-100 text-green-800"
                    }
                  >
                    {
                      {
                        [InspectStatus.Created]: "Phiếu mới",
                        [InspectStatus.Confirmed]: "Đã nhận phiếu",
                        [InspectStatus.Ready]: "Thiết bị sẵn sàng",
                        [InspectStatus.Submited]: "Đã nộp phiếu",
                        [InspectStatus.Approved]: "Đang ký duyệt",
                        [InspectStatus.Completed]: "Hoàn thành",
                      }[inspect.status]
                    }
                  </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`${Nav.INSPECTDOC_VIEW_PAGE}/${inspect.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xem</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {userWright === UserWright.Write &&
                      [InspectStatus.Created, InspectStatus.Confirmed, InspectStatus.Ready].includes(
                        inspect.status
                      ) && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`${Nav.INSPECTDOC_EDIT_PAGE}/${inspect.id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sửa</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setDeletingData(inspect)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xóa</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}

                    {[InspectStatus.Completed].includes(inspect.status) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`${Nav.INSPECTDOC_PRINT_PAGE}/${inspect.id}`} target="_blank">
                                <Printer className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>In</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setCurrentPage(1)
              setLimit(Number(value))
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Số bản ghi mỗi trang" />
            </SelectTrigger>
            <SelectContent>
              {[20, 50, 100].map((limitOption) => (
                <SelectItem key={limitOption} value={limitOption.toString()}>
                  {limitOption} bản ghi / trang
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Pagination
            pages={Math.ceil(total / limit)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
          <div className="w-20 lg:w-40" />
        </div>

        {deletingData && (
          <DeleteConfirm
            className="modal-open"
            title={`Xóa phiếu: ${deletingData.code}?`}
            setIsDeleteConfirmModalShow={setDeletingData}
            deleteFunction={() => {
              fetchWithToken(
                `${SE.API_INSPECTDOC}/${deletingData.id}`,
                { method: "DELETE" }
              )
                .then((data) => {
                  if (data.message) toast.success(data.message)
                  fetchData(params, limit, currentPage)
                })
                .catch((e: Error) => {
                  if (e.message) toast.error(e.message)
                })
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}