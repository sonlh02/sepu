"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Moment from "moment";

import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import menubar from "@/lib/menu";
import { Nav } from "@/lib/nav";
import { UserWright } from "@/enum/user_wright";
import { Status } from "@/enum/status";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Search, Plus, Trash, Edit, Eye, Download, Upload } from "lucide-react";

import { ReferenceData, ReferenceRawData } from "./[id]/powers/page";
import NewRouteModal from "./NewRouteModal";
import ViewRouteModal from "./ViewRouteModal";
import EditRouteModal from "./EditRouteModal";
import NewPowerModal from "./[id]/powers/NewPowerModal";
import UserDontAccessPage from "@/component/NotAllow";
import Pagination from "@/app/se/(auth)/Pagination";
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm";

type PowerlinesRawData = {
  data: {
    total: number;
    page: number;
    routes: Array<{
      id: number;
      name: string;
      code: string;
      note?: string;
      powers: Array<{
        id: number;
        name: string;
        code: string;
        latitude: number;
        longitude: number;
        note?: string;
        status: 1 | 2 | 3;
        powerItems: Array<{
          id: number;
          equipment: string;
          quantity: number;
          status: 1 | 2 | 3;
          note: string;
        }>;
      }>;
      numPower: number;
      status: 1 | 2 | 3 | null;
    }>;
  };
  message: string;
};

export type PowerlineData = {
  id: number;
  name: string;
  code: string;
  powerPolesTotal: number;
  status: string | null;
  note?: string;
};

export default function Routes() {
  const router = useRouter();
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [isNewModalShow, setIsNewModalShow] = useState(false);
  const [newPowerpolePowerline, setNewPowerpolePowerline] = useState<
    number | boolean
  >(false);
  const [viewingData, setViewingData] = useState<PowerlineData | null>(null);
  const [editingData, setEditingData] = useState<PowerlineData | null>(null);
  const [deletingData, setDeletingData] = useState<PowerlineData | null>(null);
  const [powerlines, setPowerlines] = useState<Array<PowerlineData>>([]);
  const [powerPoleReferenceData, setPowerPoleReferenceData] =
    useState<ReferenceData | null>(null);

  const [params, setParams] = useState({});
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [fileName, setFileName] = useState<string>("");
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
      setFile(event.target.files[0]);
      setIsFileUploaded(true);
    } else {
      setFileName("");
      setFile(null);
      setIsFileUploaded(false);
    }
  };

  const handleImportClick = () => {
    if (file) {
      const formData = new FormData();
      formData.append("routes", file);
      importRoute(formData);
    }
  };

  const exportExcel = () => {
    fetchWithToken(`${SE.API_ROUTEREPORT}?${new URLSearchParams(params)}`)
      .then((data) => {
        const worksheet = XLSX.utils.json_to_sheet(data.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tuyến");
        XLSX.writeFile(
          workbook,
          `DanhSachTuyen_${Moment(new Date()).format("DD-MM-YYYY")}.xlsx`
        );
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  };

  function fetchData(params: any, limit: number, page: number) {
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(`${SE.API_ROUTES}?${new URLSearchParams(params)}`)
      .then((response) => response as PowerlinesRawData)
      .then((data) => {
        if (!data.data) return;

        setPowerlines(
          data.data.routes.map((powerlineRawData) => ({
            id: powerlineRawData.id,
            name: powerlineRawData.name,
            code: powerlineRawData.code,
            powerPolesTotal: powerlineRawData.numPower,
            status: powerlineRawData.status
              ? {
                  [1]: Status.Okay,
                  [2]: Status.Warning,
                  [3]: Status.Error,
                }[powerlineRawData.status]
              : null,
            note: powerlineRawData.note,
          }))
        );

        setTotal(data.data.total);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  function fetchPowerPoleReferenceData(successFunction: Function) {
    if (powerPoleReferenceData) return successFunction();

    fetchWithToken(SE.API_POWERITEM)
      .then((response) => response as ReferenceRawData)
      .then((data) => {
        if (!data.data) return;

        setPowerPoleReferenceData(data.data.items);

        return successFunction();
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  function importRoute(formData: FormData) {
    fetchWithToken(SE.API_IMPORT_EXCEL, {
      method: "POST",
      headers: { "Content-Type": null },
      body: formData,
    })
      .then((data) => {
        if (data.message) {
          toast.success(data.message);
          fetchData(params, limit, currentPage);
        }
        router.push(Nav.ROUTE_PAGE);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (menubar("route")) {
      setUserWright(UserWright.Write);
      fetchData(params, limit, currentPage);
    } else if (menubar("route-view")) {
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
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center p-1">
        <h1 className="text-3xl font-bold tracking-tight p-1">
          Danh sách tuyến
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(new FormData(e.currentTarget));
            }}
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            <Input name="name" placeholder="Tên tuyến" />
            <Input name="code" placeholder="Mã tuyến" />
            <Select name="status">
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="1">Bình thường</SelectItem>
                <SelectItem value="2">Cảnh báo</SelectItem>
                <SelectItem value="3">Sự cố</SelectItem>
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
          {userWright === UserWright.Write && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <label className="cursor-pointer flex">
                      <Upload className="mr-2 h-4 w-4" />
                      Import danh sách
                      <input
                        type="file"
                        className="hidden"
                        name="routes"
                        onChange={handleFileChange}
                      />
                    </label>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import danh sách tuyến</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
              <Plus className="mr-2 h-4 w-4" /> Thêm tuyến
            </Button>
          )}
        </div>
      </div>

      {isFileUploaded && (
        <div className="flex items-center space-x-2 bg-muted p-2 rounded-md">
          <span>{fileName}</span>
          <Button size="sm" onClick={handleImportClick}>
            Import
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Mã tuyến</TableHead>
                <TableHead>Số cột</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {powerlines.map((powerline, index) => (
                <TableRow key={powerline.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {powerline.name}
                  </TableCell>
                  <TableCell>{powerline.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`${Nav.ROUTE_PAGE}/${powerline.id}/powers`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {powerline.powerPolesTotal}
                      </Link>
                      {userWright === UserWright.Write && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  fetchPowerPoleReferenceData(() =>
                                    setNewPowerpolePowerline(powerline.id)
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Thêm cột</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {powerline.status && (
                      <Badge
                        variant={
                          powerline.status === Status.Okay
                            ? "confirmed"
                            : powerline.status === Status.Warning
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {powerline.status === Status.Okay
                          ? "Bình thường"
                          : powerline.status === Status.Warning
                          ? "Cảnh báo"
                          : "Sự cố"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{powerline.note}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingData(powerline)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Xem</TooltipContent>
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
                                  onClick={() => setEditingData(powerline)}
                                >
                                  <Edit className="h-4 w-4 text-yellow-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sửa</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingData(powerline)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xóa</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
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

      {powerPoleReferenceData && typeof newPowerpolePowerline != "boolean" && (
        <NewPowerModal
          powerline={String(newPowerpolePowerline)}
          setIsNewModalShow={setNewPowerpolePowerline}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
          crossCut={true}
          referenceData={powerPoleReferenceData}
        />
      )}

      {viewingData && (
        <ViewRouteModal
          className="modal-open"
          data={viewingData}
          setViewingData={setViewingData}
        />
      )}

      {isNewModalShow && (
        <NewRouteModal
          className="modal-open"
          setIsNewModalShow={setIsNewModalShow}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
        />
      )}

      {editingData !== null && (
        <EditRouteModal
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
          title={`Xóa tuyến ${deletingData.name}?`}
          setIsDeleteConfirmModalShow={setDeletingData}
          deleteFunction={() => {
            fetchWithToken(`${SE.API_ROUTE}/${deletingData.id}`, {
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
