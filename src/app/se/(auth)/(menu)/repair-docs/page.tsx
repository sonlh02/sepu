'use client'

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
import { RepairStatus } from "@/enum/doc_status"
import { RepairData } from "./repair_data"
import UserDontAccessPage from "@/component/NotAllow"
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Pagination from "@/app/se/(auth)/Pagination"
import { Search, Plus, Eye, Edit, Trash2, Printer, FileSpreadsheet } from "lucide-react"

type RepairsRawData = {
  data: {
    total: number
    page: number
    repair_docs: Array<{
      id: number
      docNo: string
      dateRepair: string
      route: {
        id: number
        name: string
        code: string
      }
      routeCode: string
      safeMeasure?: string
      tasks: string
      result?: string
      unresolved?: string
      status: 1 | 2 | 3 | 4 | 5
      powers?: string
      repairTeams: Array<{
        id: number
        username: string
        name: string
        position: string
        lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7
        lvSafe: 1 | 2 | 3 | 4 | 5
        leader?: boolean
      }>
      repairApprovals: Array<{
        id: number
        username: string
        name: string
        position: string
        confirm?: boolean
        represent: string
      }>
      repairImages: Array<{
        id: number
        visualData: {
          id: number
          path: string
          image: string
        }
      }>
    }>
  }
  message: string
}

export default function RepairDocs() {
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [deletingData, setDeletingData] = useState<RepairData | null>(null)
  const [repairs, setRepairs] = useState<Array<RepairData>>([])
  const [params, setParams] = useState({})
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  const exportExcel = () => {
    fetchWithToken(`${SE.API_REPAIRDOCREPORT}?${new URLSearchParams(params)}`)
      .then((data) => {
        const worksheet = XLSX.utils.json_to_sheet(data.data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Phiếu sửa chữa")
        XLSX.writeFile(workbook, `DanhSachPhieuSuaChua_${Moment(new Date()).format("DD-MM-YYYY")}.xlsx`)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  function fetchData(params: any, limit: number, page: number) {
    params.limit = String(limit)
    params.page = String(page)
    fetchWithToken(
      `${SE.API_REPAIRDOCS}?${new URLSearchParams(params)}`
    )
      .then((response) => response as RepairsRawData)
      .then((data) => {
        if (!data.data) return

        setRepairs(
          data.data.repair_docs.map((repairRawData) => ({
            id: repairRawData.id,
            code: repairRawData.docNo,
            powerline: {
              id: repairRawData.route.id,
              name: repairRawData.route.name,
              code: repairRawData.route.code,
            },
            date: new Date(repairRawData.dateRepair),
            prepare: repairRawData.safeMeasure,
            approvers: repairRawData.repairApprovals.map((approverRaw) => ({
              id: approverRaw.id,
              username: approverRaw.username,
              name: approverRaw.name,
              position: approverRaw.position,
              confirm: approverRaw.confirm,
              represent: approverRaw.represent,
            })),
            workers: repairRawData.repairTeams.map((workerRaw) => ({
              id: workerRaw.id,
              username: workerRaw.username,
              name: workerRaw.name,
              position: workerRaw.position,
              workLevel: workerRaw.lvWork,
              safeLevel: workerRaw.lvSafe,
            })),
            tasks: repairRawData.tasks,
            result: repairRawData.result,
            unresolved: repairRawData.unresolved,
            powers: repairRawData.powers ? repairRawData.powers.split(",") : [],
            status: {
              1: RepairStatus.Created,
              2: RepairStatus.Confirmed,
              3: RepairStatus.Submited,
              4: RepairStatus.Approved,
              5: RepairStatus.Completed,
            }[repairRawData.status],
            images: repairRawData.repairImages.map(
              (imageRaw) => imageRaw.visualData.path
            ),
          }))
        )

        setTotal(data.data.total)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  useEffect(() => {
    if(menubar("repairdoc")) {
      setUserWright(UserWright.Write)
      fetchData(params, limit, currentPage)
    } else if(menubar("repairdoc-view")) {
      setUserWright(UserWright.Read)
      fetchData(params, limit, currentPage)
    } else {
      setUserWright(UserWright.None)
    }
  }, [params, limit, currentPage])

  if (!userWright) return null

  if (userWright === UserWright.None) return <UserDontAccessPage />

  function search(formData: FormData) {
    const searchParams = Object.fromEntries(formData)
    if (searchParams.status === 'all') {
      delete searchParams.status
    }
    setParams(searchParams)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Danh sách phiếu sửa chữa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); search(new FormData(e.currentTarget)) }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRepair">Ngày bắt đầu</Label>
              <Input type="date" id="dateRepair" name="dateRepair" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRepair_end">Ngày kết thúc</Label>
              <Input type="date" id="dateRepair_end" name="dateRepair_end" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route_code">Mã tuyến</Label>
              <Input id="route_code" name="route_code" placeholder="Nhập mã tuyến" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select name="status">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="1">Phiếu mới</SelectItem>
                  <SelectItem value="2">Đã nhận phiếu</SelectItem>
                  <SelectItem value="3">Đã nộp phiếu</SelectItem>
                  <SelectItem value="4">Đang ký duyệt</SelectItem>
                  <SelectItem value="5">Đã hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button type="submit" variant="default">
              <Search className="mr-2 h-4 w-4" /> Tìm kiếm
            </Button>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={exportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Xuất báo cáo
              </Button>
              {userWright === UserWright.Write && (
                <Button asChild>
                  <Link href={Nav.REPAIRDOC_NEW_PAGE}>
                    <Plus className="mr-2 h-4 w-4" /> Tạo phiếu sửa chữa
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Ngày sửa chữa</TableHead>
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Đội sửa chữa</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs.map((repair, index) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{Moment(repair.date).format("DD-MM-YYYY")}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{repair.code}</div>
                      <div className="text-sm text-muted-foreground">
                        Tuyến: {repair.powerline.code} ({repair.powerline.name})
                      </div>
                    </TableCell>
                    <TableCell>
                      {repair.workers.map((worker, index) => (
                        <div key={index} className="text-sm">{worker.name}</div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        repair.status === RepairStatus.Created ? "default" :
                        repair.status === RepairStatus.Confirmed ? "secondary" :
                        repair.status === RepairStatus.Submited ? "default" :
                        repair.status === RepairStatus.Approved ? "outline" :
                        "secondary"
                      }>
                        {
                          repair.status === RepairStatus.Created ? "Phiếu mới" :
                          repair.status === RepairStatus.Confirmed ? "Đã nhận phiếu" :
                          repair.status === RepairStatus.Submited ? "Đã nộp phiếu" :
                          repair.status === RepairStatus.Approved ? "Đang ký duyệt" :
                          "Hoàn thành"
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`${Nav.REPAIRDOC_VIEW_PAGE}/${repair.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {userWright === UserWright.Write &&
                          [RepairStatus.Created, RepairStatus.Confirmed].includes(repair.status) && (
                            <>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`${Nav.REPAIRDOC_EDIT_PAGE}/${repair.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingData(repair)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )
                        }
                        {[RepairStatus.Completed].includes(repair.status) && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`${Nav.REPAIRDOC_PRINT_PAGE}/${repair.id}`} target="_blank">
                              <Printer className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label htmlFor="perPage">Hiển thị:</Label>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setCurrentPage(1)
                setLimit(Number(value))
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent>
                {[20, 50, 100].map((limitOption) => (
                  <SelectItem key={limitOption} value={limitOption.toString()}>
                    {limitOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Pagination
            pages={Math.ceil(total / limit)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
          <div className="w-20 lg:w-40" />
        </div>
      </CardContent>

      {deletingData && (
        <DeleteConfirm
          className="modal-open"
          title={`Xóa phiếu: ${deletingData.code}?`}
          setIsDeleteConfirmModalShow={setDeletingData}
          deleteFunction={() => {
            fetchWithToken(
              `${SE.API_REPAIRDOC}/${deletingData.id}`, 
              { method: "DELETE" }
            )
              .then((data) => {
                if (data.message) toast.success(data.message)
                fetchData(params, limit, currentPage)
              })
              .catch((e: Error) => {
                if(e.message) toast.error(e.message)
              })
          }}
        />
      )}
    </Card>
  )
}