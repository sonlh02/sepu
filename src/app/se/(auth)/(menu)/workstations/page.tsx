"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Moment from "moment";
import * as XLSX from "xlsx";

import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import menubar from "@/lib/menu";
import { UserWright } from "@/enum/user_wright";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Trash,
  Edit,
  Eye,
  FileDown,
  Download,
} from "lucide-react";

import NewWorkstationModal from "./NewWorkstationModal";
import ViewWorkstationModal from "./ViewWorkstationModal";
import EditWorkstationModal from "./EditWorkstationModal";
import UserDontAccessPage from "@/component/NotAllow";
import Pagination from "@/app/se/(auth)/Pagination";
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm";

type DevicesRawData = {
  data: {
    total: number;
    page: number;
    workstations: Array<{
      id: number;
      name: string;
      code: string;
      note?: string;
      dateBuy: string;
      wscode: string;
      wsskey: string;
      activity: boolean;
    }>;
  };
  message: string;
};

export type DeviceData = {
  id: number;
  name: string;
  code: string;
  note?: string;
  purchaseDate: Date;
  activity: boolean;
  wsCode: string;
  wssKey: string;
};

export default function Workstations() {
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [isNewModalShow, setIsNewModalShow] = useState(false);
  const [viewingData, setViewingData] = useState<DeviceData | null>(null);
  const [editingData, setEditingData] = useState<DeviceData | null>(null);
  const [deletingData, setDeletingData] = useState<DeviceData | null>(null);
  const [devices, setDevices] = useState<Array<DeviceData>>([]);

  const [params, setParams] = useState({});
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const exportExcel = () => {
    fetchWithToken(`${SE.API_WORKSTATIONREPORT}?${new URLSearchParams(params)}`)
      .then((data) => {
        const worksheet = XLSX.utils.json_to_sheet(data.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Máy trạm");
        XLSX.writeFile(
          workbook,
          `DanhSachMayTram_${Moment(new Date()).format("DD-MM-YYYY")}.xlsx`
        );
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  };

  function fetchData(params: any, limit: number, page: number) {
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(`${SE.API_WORKSTATIONS}?${new URLSearchParams(params)}`)
      .then((response) => response as DevicesRawData)
      .then((data) => {
        if (!data.data) return;

        setDevices(
          data.data.workstations.map((deviceRawData) => ({
            id: deviceRawData.id,
            name: deviceRawData.name,
            code: deviceRawData.code,
            note: deviceRawData.note,
            purchaseDate: new Date(deviceRawData.dateBuy),
            activity: deviceRawData.activity,
            wsCode: deviceRawData.wscode,
            wssKey: deviceRawData.wsskey,
          }))
        );

        setTotal(data.data.total);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (menubar("workstation")) {
      setUserWright(UserWright.Write);
      fetchData(params, limit, currentPage);
    } else if (menubar("workstation-view")) {
      setUserWright(UserWright.Read);
      fetchData(params, limit, currentPage);
    } else {
      setUserWright(UserWright.None);
    }
  }, [params, limit, currentPage]);

  if (!userWright) return null;

  if (userWright === UserWright.None) return <UserDontAccessPage />;

  function search(formData: FormData) {
    const searchParams = Object.fromEntries(formData);
    if (searchParams.activity === "all") {
      delete searchParams.activity;
    }
    setParams(searchParams);
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center p-1">
        <h1 className="text-3xl font-bold tracking-tight p-1">
          Danh sách máy trạm
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            action={search}
          >
            <Input name="name" placeholder="Tên máy trạm" />
            <Input name="code" placeholder="Mã máy trạm" />
            <Select name="activity">
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-24">
              <Search className="mr-2 h-4 w-4" /> Tìm kiếm
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="justify-between items-center">
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={exportExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Xuất báo cáo
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xuất báo cáo Excel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-medium mt-4">Tổng số: {total}</div>
          {userWright === UserWright.Write && (
            <Button onClick={() => setIsNewModalShow(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm máy trạm
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Ngày mua</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device, index) => (
                <TableRow key={device.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{device.code}</TableCell>
                  <TableCell>
                    {Moment(device.purchaseDate).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={device.activity ? "confirmed" : "destructive"}
                    >
                      {device.activity ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>{device.note}</TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingData(device)}
                          >
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
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingData(device)}
                              >
                                <Edit className="h-4 w-4 text-yellow-500" />
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
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingData(device)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
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
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Số bản ghi mỗi trang:</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setCurrentPage(1);
              setLimit(Number(value));
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[20, 50, 100].map((limitOption) => (
                <SelectItem key={limitOption} value={String(limitOption)}>
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

      {viewingData && (
        <ViewWorkstationModal
          className="modal-open"
          data={viewingData}
          setViewingData={setViewingData}
        />
      )}

      {isNewModalShow && (
        <NewWorkstationModal
          className="modal-open"
          setIsNewModalShow={setIsNewModalShow}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
        />
      )}

      {editingData && (
        <EditWorkstationModal
          data={editingData}
          setEditingData={setEditingData}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
        />
      )}

      {deletingData && (
        <DeleteConfirm
          className="modal-open"
          title={`Xóa thiết bị ${deletingData.name}?`}
          setIsDeleteConfirmModalShow={setDeletingData}
          deleteFunction={() => {
            fetchWithToken(`${SE.API_WORKSTATION}/${deletingData.id}`, {
              method: "DELETE",
            })
              .then((data) => {
                if (data.message) toast.success(data.message);
                fetchData(params, limit, currentPage);
              })
              .catch((e: Error) => {
                if (e.message) toast.error(e.message);
              });
          }}
        />
      )}
    </div>
  );
}
