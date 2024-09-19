'use client'

import { useEffect, useState } from "react"
import { LatLngExpression } from "leaflet"
import { toast } from "react-toastify"
import Moment from "moment"
import * as XLSX from 'xlsx'
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import menubar from "@/lib/menu"
import { UserWright } from "@/enum/user_wright"
import { Search, Download, Trash, Edit, Eye, Calendar, MapPin } from "lucide-react"
import ViewIncidentFlyModal from "./ViewIncidentFlyModal"
import UserDontAccessPage from "@/component/NotAllow"
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Pagination from "../../Pagination"

type IncidentsFlyRawData = {
  data: {
    incident_flies: Array<{
      id: number;
      inspectDoc: {
        docNo: string;
        routeCode: string;
      }
      power: {
        id: number;
        name: string;
        code: string;
        latitude: number;
        longitude: number;
      };
      pole: string;
      line: string;
      latitude: number;
      longitude: number;
      altitude: number;
      incident: string;
      incidentType: string;
      dateWarning: string;
      lvWarning: number;
      visualData: {
        id: number;
        path: string;
        image: string;
      };
    }>;
    total: number;
    page: number;
  };
};

export type IncidentFlyData = {
  id: number;
  docNo: string;
  routeCode: string;
  power: {
    id: number;
    name: string;
    code: string;
    latitude: number;
    longitude: number;
  };
  pole: string;
  line: string;
  coordinates: LatLngExpression;
  altitude: number;
  incident: string;
  incidentType: string;
  dateWarning: Date;
  lvWarning: number;
  path?: string;
};

export default function IncidentManager() {
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [isNewModalShow, setIsNewModalShow] = useState(false);
  const [viewingData, setViewingData] = useState<IncidentFlyData | null>(null);
  const [editingData, setEditingData] = useState<IncidentFlyData | null>(null);
  const [deletingData, setDeletingData] = useState<IncidentFlyData | null>(
    null
  );
  const [incidentsFly, setIncidentsFly] = useState<Array<IncidentFlyData>>([]);
  const [params, setParams] = useState({});
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const exportExcel = () => {
    fetchWithToken(`${SE.API_INCIDENTFLYREPORT}?${new URLSearchParams(params)}`)
      .then((data) => {
        const worksheet = XLSX.utils.json_to_sheet(data.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cảnh báo bay");
        XLSX.writeFile(workbook, `DanhSachBatThuongKhiBay_${Moment(new Date()).format("DD-MM-YYYY")}.xlsx`);
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }

  function fetchData(params: any, limit: number, page: number){
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(
      `${SE.API_INCIDENTFLY}?${new URLSearchParams(params)}`
    )
      .then((response) => response as IncidentsFlyRawData)
      .then((data) => {
        if (!data.data) return;

        setIncidentsFly(
          data.data.incident_flies.map((incidentFlyRawData) => ({
            id: incidentFlyRawData.id,
            docNo: incidentFlyRawData.inspectDoc.docNo,
            routeCode: incidentFlyRawData.inspectDoc.routeCode,
            power: incidentFlyRawData.power,
            pole: incidentFlyRawData.pole,
            line: incidentFlyRawData.line,
            coordinates: [
              incidentFlyRawData.latitude,
              incidentFlyRawData.longitude,
            ],
            altitude: incidentFlyRawData.altitude,
            incident: incidentFlyRawData.incident,
            incidentType: incidentFlyRawData.incidentType,
            dateWarning: new Date(incidentFlyRawData.dateWarning),
            lvWarning: incidentFlyRawData.lvWarning,
            path: incidentFlyRawData.visualData.path,
          }))
        );

        setTotal(data.data.total);
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  };

  useEffect(() => {
    if(menubar("incidentfly")) {
      setUserWright(UserWright.Read);
      fetchData(params, limit, currentPage);
    } else {
      setUserWright(UserWright.None);
    }
  }, [params, limit, currentPage]);

  if (!userWright) return <></>

  if (userWright === UserWright.None) return <UserDontAccessPage />

  function search(formData: FormData) {
    setParams(Object.fromEntries(formData))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Danh sách bất thường khi bay</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); search(new FormData(e.currentTarget)); }} className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <Input name="routeCode" placeholder="Mã tuyến" />
            </div>
            <div className="flex-1">
              <Input type="date" name="dateWarning" placeholder="Ngày cảnh báo (từ)" />
            </div>
            <div className="flex-1">
              <Input type="date" name="dateWarning_end" placeholder="Ngày cảnh báo (đến)" />
            </div>
          </div>
          <div className="flex justify-between">
            <Button type="submit" variant="default">
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
            <Button variant="outline" onClick={exportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </form>

        <Separator className="my-6" />

        <div className="flex justify-between items-center mb-4">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Tổng số bản ghi: {total}
          </Badge>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Tuyến</TableHead>
                <TableHead>Tên cột</TableHead>
                <TableHead>Tọa độ</TableHead>
                <TableHead>Bất thường</TableHead>
                <TableHead>Ngày cảnh báo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentsFly.map((incidentFly, index) => (
                <TableRow key={incidentFly.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{incidentFly.routeCode}</TableCell>
                  <TableCell>{incidentFly.power.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="flex flex-col font-mono">
                      {Object.entries(incidentFly.coordinates).map(
                      ([numberType, number]) => (
                        <span className="font-mono" key={numberType}>
                          {number}
                        </span>
                      )
                    )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{incidentFly.incident}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {incidentFly.dateWarning.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setViewingData(incidentFly)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Xem</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {userWright === UserWright.Write && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingData(incidentFly)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Sửa</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setDeletingData(incidentFly)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xóa</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
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
      </CardContent>

      {viewingData && (
        <ViewIncidentFlyModal
          className="modal-open"
          data={viewingData}
          setViewingData={setViewingData}
        />
      )}
    </Card>
  )
}