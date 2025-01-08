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

import { Search, Plus, Trash2, Edit, Eye, FileSpreadsheet } from "lucide-react";

import NewUavModal from "./NewUavModal";
import ViewUavModal from "./ViewUavModal";
import EditUavModal from "./EditUavModal";
import UserDontAccessPage from "@/component/NotAllow";
import Pagination from "@/app/se/(auth)/Pagination";
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm";

type DevicesRawData = {
  data: {
    total: number;
    page: number;
    flycams: Array<{
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

export default function Uavs() {
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
    fetchWithToken(`${SE.API_FLYCAMREPORT}?${new URLSearchParams(params)}`)
      .then((data) => {
        const worksheet = XLSX.utils.json_to_sheet(data.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Thiết bị bay");
        XLSX.writeFile(
          workbook,
          `DanhSachThietBiBay_${Moment(new Date()).format("DD-MM-YYYY")}.xlsx`
        );
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  };

  function fetchData(params: any, limit: number, page: number) {
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(`${SE.API_FLYCAMS}?${new URLSearchParams(params)}`)
      .then((response) => response as DevicesRawData)
      .then((data) => {
        if (!data.data) return;

        setDevices(
          data.data.flycams.map((deviceRawData) => ({
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
    if (menubar("flycam")) {
      setUserWright(UserWright.Write);
      fetchData(params, limit, currentPage);
    } else if (menubar("flycam-view")) {
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
    if (searchParams.status === "all") {
      delete searchParams.status;
    }
    setParams(searchParams);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          Danh sách thiết bị bay
          <Badge variant="secondary" className="text-lg">
            Tổng: {total}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(new FormData(e.currentTarget));
          }}
          className="space-y-4 mb-6"
        >
          <div className="flex flex-wrap gap-4">
            <Input
              name="name"
              placeholder="Tên thiết bị bay"
              className="flex-1"
            />
            <Input
              name="code"
              placeholder="Mã thiết bị bay"
              className="flex-1"
            />
            <Select name="activity">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button type="submit" className="w-32">
              <Search className="mr-2 h-4 w-4" /> Tìm kiếm
            </Button>
            <div className="space-x-2">
              <Button onClick={exportExcel} variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Xuất báo cáo
              </Button>
              {userWright === UserWright.Write && (
                <Button onClick={() => setIsNewModalShow(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Thêm thiết bị bay
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="rounded-md border">
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
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{device.code}</TableCell>
                  <TableCell>
                    {Moment(device.purchaseDate).format("DD-MM-YYYY")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={device.activity ? "default" : "destructive"}
                    >
                      {device.activity ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={device.note}>
                      {device.note}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
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
                                size="sm"
                                onClick={() => setEditingData(device)}
                              >
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingData(device)}
                              >
                                <Trash2 className="h-4 w-4" />
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

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Số bản ghi mỗi trang</p>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setCurrentPage(1);
                setLimit(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
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
          <div className="text-sm text-muted-foreground">
            Tổng số: <span className="font-medium">{total}</span> bản ghi
          </div>
        </div>
      </CardContent>

      {viewingData && (
        <ViewUavModal
          className="modal-open"
          data={viewingData}
          setViewingData={setViewingData}
        />
      )}

      {isNewModalShow && (
        <NewUavModal
          setIsNewModalShow={setIsNewModalShow}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
        />
      )}

      {editingData && (
        <EditUavModal
          className="modal-open"
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
            fetchWithToken(`${SE.API_FLYCAM}/${deletingData.id}`, {
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
    </Card>
  );
}
