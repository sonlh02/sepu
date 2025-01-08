"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import menubar from "@/lib/menu";
import { UserWright } from "@/enum/user_wright";
import { Gender } from "@/enum/gender";
import {
  Search,
  Plus,
  Trash2,
  PenSquare,
  Eye,
  Users as UsersIcon,
} from "lucide-react";
import NewUserModal from "./NewUserModal";
import ViewUserModal from "./ViewUserModal";
import EditUserModal from "./EditUserModal";
import UserDontAccessPage from "@/component/NotAllow";
import Pagination from "@/app/se/(auth)/Pagination";
import DeleteConfirm from "@/app/se/(auth)/(menu)/_modal/DeleteConfirm";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type UsersRawData = {
  data: {
    total: number;
    page: number;
    users: Array<{
      id: number;
      username: string;
      name: string;
      usercode: string;
      phone: string;
      email: string;
      role: {
        id: number;
        name: string;
      };
      activity: boolean;
      avatar?: string;
      signature?: string;
      gender: 1 | 2;
      department: string;
      position: string;
      lvWork?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      lvSafe?: 1 | 2 | 3 | 4 | 5;
      language?: string;
      level?: 0 | 1;
    }>;
  };
  message: string;
};

export type UserData = {
  id: number;
  username: string;
  displayName: string;
  usercode: string;
  phone: string;
  email: string;
  gender: Gender;
  role: {
    id: number;
    name: string;
  };
  activity: boolean;
  department: string;
  position: string;
  workLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  safeLevel?: 1 | 2 | 3 | 4 | 5;
  level?: 0 | 1;
};

type ReferenceRawData = {
  data: {
    items: {
      roles: {
        [key: string]: string;
      };
      genders: {
        [key: string]: string;
      };
    };
  };
};

export type ReferenceData = {
  roles: {
    [key: string]: string;
  };
};

export default function Users() {
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [isNewModalShow, setIsNewModalShow] = useState(false);
  const [viewingData, setViewingData] = useState<UserData | null>(null);
  const [editingData, setEditingData] = useState<UserData | null>(null);
  const [deletingData, setDeletingData] = useState<UserData | null>(null);
  const [users, setUsers] = useState<Array<UserData>>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(
    null
  );

  const [params, setParams] = useState<Record<string, string>>({});
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  function fetchData(
    params: Record<string, string>,
    limit: number,
    page: number
  ) {
    const queryParams = new URLSearchParams({
      ...params,
      limit: String(limit),
      page: String(page),
    });
    fetchWithToken(`${SE.API_USERS}?${queryParams}`)
      .then((response) => response as UsersRawData)
      .then((data) => {
        if (!data.data) return;

        setUsers(
          data.data.users.map((userRawData) => ({
            id: userRawData.id,
            username: userRawData.username,
            displayName: userRawData.name,
            usercode: userRawData.usercode,
            phone: userRawData.phone,
            email: userRawData.email,
            gender: {
              1: Gender.Male,
              2: Gender.Female,
            }[userRawData.gender],
            role: {
              id: userRawData.role.id,
              name: userRawData.role.name,
            },
            activity: userRawData.activity,
            department: userRawData.department,
            position: userRawData.position,
            workLevel: userRawData.lvWork,
            safeLevel: userRawData.lvSafe,
            level: userRawData.level,
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

    fetchWithToken(SE.API_USERITEM)
      .then((response) => response as ReferenceRawData)
      .then((data) => {
        if (!data.data) return;

        setReferenceData({
          roles: data.data.items.roles,
        });

        return successFunction();
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (menubar("user")) {
      setUserWright(UserWright.Write);
      fetchData(params, limit, currentPage);
    } else if (menubar("user-view")) {
      setUserWright(UserWright.Read);
      fetchData(params, limit, currentPage);
    } else {
      setUserWright(UserWright.None);
    }
  }, [params, limit, currentPage]);

  if (!userWright) return null;
  if (userWright === UserWright.None) return <UserDontAccessPage />;

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newParams: Record<string, string> = {};

    // Use Array.from() to create an array of entries that can be iterated
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() !== "") {
        if (key === "activity" && value === "all") {
          // Skip 'all' value for activity
          return;
        }
        newParams[key] = value.trim();
      }
    });

    setParams(newParams);
    setCurrentPage(1); // Reset to first page when searching
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <UsersIcon className="w-6 h-6" />
          Danh sách người dùng
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
          onSubmit={search}
        >
          <Input name="name" placeholder="Tên người dùng" />
          <Input name="email" placeholder="Email" />
          <Input name="phone" placeholder="Số điện thoại" />
          <Input name="department" placeholder="Phòng ban/Đơn vị" />
          <Input name="position" placeholder="Vị trí" />
          <Select name="activity">
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Hoạt động</SelectItem>
              <SelectItem value="false">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full md:w-auto">
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>
        </form>

        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-semibold">
            Tổng số người dùng: <span className="text-primary">{total}</span>
          </div>
          {userWright === UserWright.Write && (
            <Button
              onClick={() => fetchReferenceData(() => setIsNewModalShow(true))}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm người dùng
            </Button>
          )}
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-[50px] text-center">STT</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.displayName}`}
                          alt={user.displayName}
                        />
                        <AvatarFallback>
                          {user.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {{
                            [Gender.Male]: "Nam",
                            [Gender.Female]: "Nữ",
                          }[user.gender] || "Khác"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{user.phone}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell>
                    <Badge variant={user.activity ? "default" : "destructive"}>
                      {user.activity ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>{user.position}</div>
                    {user.department && (
                      <div className="text-sm text-muted-foreground">
                        {user.department}
                      </div>
                    )}
                    {(user.workLevel || user.safeLevel) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.workLevel && (
                          <span>Bậc thợ: {user.workLevel}/7</span>
                        )}
                        {user.workLevel && user.safeLevel && " | "}
                        {user.safeLevel && (
                          <span>Bậc an toàn: {user.safeLevel}/5</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingData(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Xem chi tiết</p>
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
                                onClick={() =>
                                  fetchReferenceData(() => setEditingData(user))
                                }
                              >
                                <PenSquare className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Chỉnh sửa</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingData(user)}
                              >
                                <Trash2 className="w-4 h-4" />
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
        <ViewUserModal
          className="modal-open"
          data={viewingData}
          setViewingData={setViewingData}
        />
      )}

      {referenceData && isNewModalShow && (
        <NewUserModal
          setIsNewModalShow={setIsNewModalShow}
          fetchData={fetchData}
          params={params}
          limit={limit}
          currentPage={currentPage}
          referenceData={referenceData}
        />
      )}

      {referenceData && editingData && (
        <EditUserModal
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
          title={`Xóa người dùng ${deletingData.displayName}?`}
          setIsDeleteConfirmModalShow={setDeletingData}
          deleteFunction={() => {
            fetchWithToken(`${SE.API_USER}/${deletingData.id}`, {
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
