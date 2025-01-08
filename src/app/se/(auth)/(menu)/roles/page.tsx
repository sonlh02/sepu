"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import menubar from "@/lib/menu";
import { UserWright } from "@/enum/user_wright";
import { Search, Plus, Trash2, Edit, Eye, Users } from "lucide-react";
import NewRoleModal from "./NewRoleModal";
import ViewRoleModal from "./ViewRoleModal";
import EditRoleModal from "./EditRoleModal";
import UserDontAccessPage from "@/component/NotAllow";
import Pagination from "@/app/se/(auth)/Pagination";
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type RolesRawData = {
  data: {
    total: number;
    page: number;
    roles: Array<{
      id: number;
      name: string;
      description?: string;
      item: string;
    }>;
  };
  message: string;
};

export type RoleData = {
  id: number;
  name: string;
  description?: string;
  items: Array<string>;
};

type ReferenceRawData = {
  data: {
    items: {
      [key: string]: {
        [key: string]: string;
      };
    };
    message: string;
  };
};

export type ReferenceData = {
  [key: string]: {
    [key: string]: string;
  };
};

export default function Roles() {
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [isNewModalShow, setIsNewModalShow] = useState(false);
  const [viewingData, setViewingData] = useState<RoleData | null>(null);
  const [editingData, setEditingData] = useState<RoleData | null>(null);
  const [deletingData, setDeletingData] = useState<RoleData | null>(null);
  const [roles, setRoles] = useState<Array<RoleData>>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(
    null
  );

  const [params, setParams] = useState({});
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  function fetchData(params: any, limit: number, page: number) {
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(`${SE.API_ROLES}?${new URLSearchParams(params)}`)
      .then((response) => response as RolesRawData)
      .then((data) => {
        if (!data.data) return;

        setRoles(
          data.data.roles.map((roleRawData) => ({
            id: roleRawData.id,
            name: roleRawData.name,
            description: roleRawData.description,
            items: roleRawData.item.split(","),
          }))
        );

        setTotal(data.data.total);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  function fetchReferenceData(successFunction: Function) {
    if (referenceData) return successFunction();

    fetchWithToken(SE.API_ROLEITEM)
      .then((response) => response as ReferenceRawData)
      .then((data) => {
        if (!data.data) return;

        setReferenceData(data.data.items);

        return successFunction();
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (menubar("role")) {
      setUserWright(UserWright.Write);
      fetchData(params, limit, currentPage);
    } else if (menubar("role-view")) {
      setUserWright(UserWright.Read);
      fetchData(params, limit, currentPage);
    } else {
      setUserWright(UserWright.None);
    }
  }, [params, limit, currentPage]);

  if (!userWright) return null;
  if (userWright === UserWright.None) return <UserDontAccessPage />;

  function search(formData: FormData) {
    setParams(Object.fromEntries(formData));
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Users className="mr-2 h-6 w-6" />
          Danh sách vai trò
        </CardTitle>
        <CardDescription>
          Quản lý và phân quyền các vai trò trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <form
              className="flex-1 flex items-center space-x-2"
              action={search}
            >
              <Input
                className="flex-1"
                name="name"
                placeholder="Tìm kiếm vai trò..."
              />
              <Button type="submit" variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Tìm kiếm
              </Button>
            </form>
            {userWright === UserWright.Write && (
              <Button
                onClick={() =>
                  fetchReferenceData(() => setIsNewModalShow(true))
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Thêm vai trò
              </Button>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">STT</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role, index) => (
                  <TableRow key={role.id}>
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setViewingData(role)}
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
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      fetchReferenceData(() =>
                                        setEditingData(role)
                                      )
                                    }
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
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setDeletingData(role)}
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
                      </div>
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
        </div>
      </CardContent>

      {/* Keep the modal components as they are */}
      {viewingData && (
        <ViewRoleModal
          className="modal-open"
          data={viewingData}
          setViewingData={setViewingData}
        />
      )}

      {referenceData && isNewModalShow && (
        <NewRoleModal
          setIsNewModalShow={setIsNewModalShow}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
          referenceData={referenceData}
        />
      )}

      {referenceData && editingData && (
        <EditRoleModal
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
          title={`Xóa người dùng ${deletingData.name}?`}
          setIsDeleteConfirmModalShow={setDeletingData}
          deleteFunction={() => {
            fetchWithToken(`${SE.API_ROLE}/${deletingData.id}`, {
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
