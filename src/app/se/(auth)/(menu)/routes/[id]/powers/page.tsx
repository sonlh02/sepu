'use client'

import { useEffect, useState } from "react"
import { useParams } from 'next/navigation'
import { LatLngExpression } from "leaflet"
import { toast } from "react-toastify"
import Moment from "moment"
import * as XLSX from 'xlsx'

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import menubar from "@/lib/menu"

import { UserWright } from "@/enum/user_wright"
import { Status } from "@/enum/status"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { Search, Plus, Edit, Trash, Eye, Download } from "lucide-react"
import NewPowerModal from "./NewPowerModal"
import ViewPowerModal from "./ViewPowerModal"
import EditPowerModal from "./EditPowerModal"
import UserDontAccessPage from "@/component/NotAllow"
import Pagination from "@/app/se/(auth)/Pagination"
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm"
import { cn } from "@/lib/utils"

type PowerPolesRawData = {
  data: {
    routeCode: string;
    total: number;
    page: number;
    route: string;
    powers: Array<{
      id: number;
      name: string;
      code: string;
      latitude: number;
      longitude: number;
      note?: string;
      origin: string;
      status: 1 | 2 | 3;
      powerItems: Array<{
        id: number;
        text: string;
        equipment: string;
        quantity?: number;
        status: 1 | 2 | 3;
        note?: string;
      }>;
    }>;
  };
  message: string;
};

export type PowerPoleData = {
  id: number;
  name: string;
  code: string;
  coordinates: LatLngExpression;
  origin: string;
  items: {
    [key: string]: {
      name: string;
      quantity?: number;
      status: Status;
      note?: string;
    };
  };
  activity: Status;
  note?: string;
};

export type ReferenceRawData = {
  data: {
    items: {
      items: {
        [key: string]: string;
      };
      status: {
        [key: string]: string;
      };
    };
  };
  message: string;
};

export type ReferenceData = {
  items: {
    [key: string]: string;
  };
  status: {
    [key: string]: string;
  };
};

export default function Powers() {
  const url: {id: string} = useParams();
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [powerlineName, setPowerlineName] = useState("");
  const [powerlineCode, setPowerlineCode] = useState("");
  const [isNewModalShow, setIsNewModalShow] = useState<number | boolean>(false);
  const [viewingData, setViewingData] = useState<PowerPoleData | null>(null);
  const [editingData, setEditingData] = useState<PowerPoleData | null>(null);
  const [deletingData, setDeletingData] = useState<PowerPoleData | null>(null);
  const [powerPoles, setPowerPoles] = useState<Array<PowerPoleData>>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(
    null
  );

  const [params, setParams] = useState({});
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const route = url.id;

  const exportExcel = () => {
    fetchWithToken(`${SE.API_ROUTE}/${route}/power/report?${new URLSearchParams(params)}`)
      .then((data) => {
        const worksheet = XLSX.utils.json_to_sheet(data.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cột");
        XLSX.writeFile(workbook, `DanhSachCotTuyen${powerlineCode}_${Moment(new Date()).format("DD-MM-YYYY")}.xlsx`);
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }

  function fetchData(route: string, params: any, limit: number, page: number) {
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(
      `${SE.API_ROUTE}/${route}/powers?${new URLSearchParams(params)}`
    )
      .then((response) => response as PowerPolesRawData)
      .then((data) => {
        if (!data.data) return;

        setPowerlineName(data.data.route);
        setPowerlineCode(data.data.routeCode);

        setPowerPoles(
          data.data.powers.map((powerPoleRawData) => ({
            id: powerPoleRawData.id,
            name: powerPoleRawData.name,
            code: powerPoleRawData.code,
            origin: powerPoleRawData.origin,
            coordinates: [
              powerPoleRawData.latitude,
              powerPoleRawData.longitude,
            ],
            items: Object.assign(
              {},
              ...powerPoleRawData.powerItems.map((powerItemRaw) => ({
                [powerItemRaw.equipment]: {
                  name: powerItemRaw.text,
                  quantity: powerItemRaw.quantity,
                  status: {
                    [1]: Status.Okay,
                    [2]: Status.Warning,
                    [3]: Status.Error,
                  }[powerItemRaw.status],
                  note: powerItemRaw.note,
                },
              }))
            ),
            activity: {
              1: Status.Okay,
              2: Status.Warning,
              3: Status.Error,
            }[powerPoleRawData.status],
            note: powerPoleRawData.note,
          }))
        );
        setTotal(data.data.total);
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }

  function fetchReferenceData(successFunction: Function) {
    if (referenceData) return successFunction();

    fetchWithToken(SE.API_POWERITEM)
      .then((response) => response as ReferenceRawData)
      .then((data) => {
        if (!data.data) return;

        setReferenceData(data.data.items);

        return successFunction();
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if(menubar("route")) {
      setUserWright(UserWright.Write);
      fetchData(url.id, params, limit, currentPage);
    } else if(menubar("route-view")) {
      setUserWright(UserWright.Read);
      fetchData(url.id, params, limit, currentPage);
    } else {
      setUserWright(UserWright.None);
    }
  }, [url, params, limit, currentPage]);

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
    <div className="container mx-auto py-6 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Danh sách cột {powerlineName && `(${powerlineName})`}</CardTitle>
          <Badge variant="outline" className="text-sm font-medium">
            Tổng: {total}
          </Badge>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-4 items-center mb-6" action={search}>
            <Input name="name" placeholder="Tên cột" className="max-w-xs" />
            <Input name="code" placeholder="Mã cột" className="max-w-xs" />
            <Select name="status">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="1">Bình thường</SelectItem>
                <SelectItem value="2">Cảnh báo</SelectItem>
                <SelectItem value="3">Báo động</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
          </form>

          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={exportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Xuất báo cáo
            </Button>
            {userWright === UserWright.Write && (
              <Button onClick={() => fetchReferenceData(() => setIsNewModalShow(true))}>
                <Plus className="mr-2 h-4 w-4" /> Thêm cột
              </Button>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">STT</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mã cột</TableHead>
                  <TableHead>Tọa độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {powerPoles.map((powerPole, index) => (
                  <TableRow key={powerPole.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{powerPole.name}</TableCell>
                    <TableCell>{powerPole.code}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {Object.entries(powerPole.coordinates).map(
                          ([numberType, number]) => (
                            <span className="font-mono text-sm" key={numberType}>
                              {number}
                            </span>
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={powerPole.activity === Status.Error ? "destructive" : "outline"}
                        className={cn(
                          powerPole.activity === Status.Okay && "border-green-500 bg-green-50 text-green-700",
                          powerPole.activity === Status.Warning && "border-yellow-500 bg-yellow-50 text-yellow-700"
                        )}
                      >
                        {
                          {
                            [Status.Okay]: 'Bình thường',
                            [Status.Warning]: 'Cảnh báo',
                            [Status.Error]: 'Báo động',
                          }[powerPole.activity]
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setViewingData(powerPole)}>
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
                                  <Button variant="ghost" size="icon" onClick={() => fetchReferenceData(() => setEditingData(powerPole))}>
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
                                  <Button variant="ghost" size="icon" onClick={() => setDeletingData(powerPole)}>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Hiển thị</p>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setCurrentPage(1)
                  setLimit(Number(value))
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  {[20, 50, 100].map((limitOption) => (
                    <SelectItem key={limitOption} value={limitOption.toString()}>
                      {limitOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm font-medium">trên trang</p>
            </div>

            <Pagination
              pages={Math.ceil(total / limit)}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
            <div className="w-20 lg:w-40" />
          </div>
        </CardContent>
      </Card>

      {viewingData && (
        <ViewPowerModal
          data={viewingData}
          setViewingData={setViewingData}
        />
      )}

      {referenceData && isNewModalShow && (
        <NewPowerModal
          powerline={url.id}
          setIsNewModalShow={setIsNewModalShow}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
          crossCut={false}
          referenceData={referenceData}
        />
      )}

      {referenceData && editingData && (
        <EditPowerModal
          powerline={url.id}
          data={editingData}
          setEditingData={setEditingData}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
          referenceData={referenceData}
        />
      )}

      {deletingData && (
        <DeleteConfirm
          className="modal-open"
          title={`Xóa cột ${deletingData.name}?`}
          setIsDeleteConfirmModalShow={setDeletingData}
          deleteFunction={() => {
            fetchWithToken(
              `${SE.API_ROUTE}/${url.id}/power/${deletingData.id}`,
              { method: "DELETE" }
            )
              .then((data) => {
                if (data.message) toast.success(data.message);

                fetchData(url.id, params, limit, currentPage);
              })
              .catch((e: Error) => {
                if(e.message) toast.error(e.message);
              });
          }}
        />
      )}
    </div>
  )
}