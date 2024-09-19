'use client'

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "react-toastify"
import Link from "next/link"
import Moment from "moment"
import _ from "lodash"
import Select, { SingleValue } from "react-select"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import menubar from "@/lib/menu"
import { Nav } from "@/lib/nav"
import { UserWright } from "@/enum/user_wright"
import { RepairData } from "../../repair_data"
import { fetchRepairData } from "../../fetch_repair_data"
import { ReferenceData, fetchReferenceData } from "../../fetch_reference_data"
import UserDontAccessPage from "@/component/NotAllow"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarIcon, UserIcon, ClipboardListIcon, ShieldCheckIcon, UserPlusIcon } from "lucide-react"

type UserData = {
  username: string;
  phone: string;
  name: string;
  lv_work?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  position: string;
  usercode: string;
  department: string;
  lv_safe?: 1 | 2 | 3 | 4 | 5;
};

type Approver = {
  username: string;
  name: string;
  position: string;
  represent: string;
};

type UserOption = {
  value: string;
  label: string;
  userData: UserData;
};

export default function EditDoc({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [data, setData] = useState<RepairData | null>();
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(
    null
  );
  const [date, setDate] = useState(new Date());
  const represent = ["Tổ QLVH", "Đội đường dây", "Đội QL LĐCT"];
  const [approvers, setApprovers] = useState<
    Array<{
      value: string;
      label: string;
      name: string;
      userData: {
        id: number;
        username: string;
        name: string;
        position: string;
        represent: string;
        signature?: string;
      };
      username: string;
    }>
  >([]);
  const [workers, setWorkers] = useState<
    Array<{
      value: string;
      label: string;
      name: string;
      userData: {
        id: number;
        username: string;
        name: string;
        position: string;
        lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7;
        lvSafe: 1 | 2 | 3 | 4 | 5;
        signature?: string;
      };
      username: string;
    }>
  >([]);
  const [poles, setPoles] = useState<
  Array<{ value: string; label: string }>
  >([]);
  const [currentPowerline, setCurrentPowerline] = useState("");
  const [isDataloaded, setIsDataloaded] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState<(UserData | null)[]>(
    new Array(5).fill(null)
  );
  const [selectedApprovers, setSelectedApprovers] = useState<Approver[]>([]);
  const [selectedRepresent, setSelectedRepresent] = useState<(string | null)[]>(
    Array(3).fill(null)
  );

  const handleWorkerChange = (
    i: number,
    selectedOption: SingleValue<UserOption> | null
  ) => {
    const userData = selectedOption?.userData || null;
    const newSelectedWorkers = [...selectedWorkers];
    newSelectedWorkers[i] = userData;
    setSelectedWorkers(newSelectedWorkers);
  };

  const handleApproverChange = (
    index: number,
    selectedOption: SingleValue<UserOption> | null
  ) => {
    const newSelectedApprovers = [...selectedApprovers];
    const newSelectedRepresent = [...selectedRepresent];

    if (selectedOption) {
      if (
        !approvers[index] || // Nếu không có dữ liệu cũ
        approvers[index].username !== selectedOption.value // Nếu người dùng thay đổi người ký duyệt
      ) {
        // Reset giá trị represent về rỗng
        newSelectedRepresent[index] = null;
      } else {
        // Giữ nguyên giá trị represent từ dữ liệu cũ
        newSelectedRepresent[index] = approvers[index].userData.represent || "";
      }

      newSelectedApprovers[index] = {
        username: selectedOption.value,
        name: selectedOption.userData.name,
        position: selectedOption.userData.position,
        represent: newSelectedRepresent[index] || "", // Giữ lại represent nếu chưa thay đổi
      };
    } else {
      // Nếu không có lựa chọn nào, reset dữ liệu
      newSelectedApprovers[index] = {
        username: "",
        name: "",
        position: "",
        represent: "",
      };
      newSelectedRepresent[index] = null;
    }

    setSelectedApprovers(newSelectedApprovers);
    setSelectedRepresent(newSelectedRepresent);
  };

  function create(formData: FormData) {
    if (!data) return;

    const prepare = formData.get("prepare")?.toString() || "";
    const tasks = formData.get("tasks")?.toString() || "";

    if (!referenceData) {
      return;
    }

    //Sửa nhân viên sửa chữa
    // Dữ liệu cũ từ workers
    const currentUsernames = data.workers.map((worker) => worker.username);

    // Dữ liệu mới từ selectedWorkers
    const newUsernames = selectedWorkers
      .filter((worker) => worker !== null)
      .map((worker) => {
        return {
          index: selectedWorkers.indexOf(worker), // Lấy chỉ số của dòng
          username:
            Object.keys(referenceData.users).find(
              (key) => referenceData.users[key].usercode === worker?.usercode
            ) || "",
        };
      });

    // Tạo Map để theo dõi dữ liệu dựa trên chỉ số
    const usernameMap = new Map<number, string>();

    // Thêm dữ liệu cũ vào Map
    currentUsernames.forEach((username, index) => {
      usernameMap.set(index, username);
    });

    // Cập nhật dữ liệu mới vào Map chỉ khi giá trị mới có mặt
    newUsernames.forEach(({ index, username }) => {
      if (username) {
        usernameMap.set(index, username);
      }
    });

    // Chuyển Map thành mảng các đối tượng
    const updatedUsernames = Array.from(usernameMap.values());

    //Sửa người ký duyệt
    const currentApprovers = data.approvers || []; // Dữ liệu cũ
    const newApprovers = selectedApprovers || []; // Dữ liệu mới

    // Tạo một Map để quản lý các approver dựa trên chỉ số
    const approverMap = new Map<
      number,
      { username: string; represent: string }
    >();

    // Thêm các approver hiện tại vào Map với chỉ số là khóa
    currentApprovers.forEach((approver, index) => {
      if (approver && approver.username) {
        approverMap.set(index, {
          username: approver.username,
          represent: approver.represent || "",
        });
      }
    });

    // Cập nhật các approver mới vào Map hoặc thêm mới nếu không tồn tại
    newApprovers.forEach((approver, index) => {
      if (approver && approver.username) {
        // Luôn cập nhật dòng với dữ liệu mới, dù represent rỗng
        approverMap.set(index, {
          username: approver.username,
          represent: approver.represent || "",
        });
      }
    });

    // Chuyển Map thành mảng các đối tượng
    const updatedApprovers = Array.from(approverMap.values());

    fetchWithToken(
      `${SE.API_REPAIRDOC}/${params.id}`, 
      {
      method: "PUT",
      body: JSON.stringify({
        safe_measure: prepare,
        tasks: tasks,
        approver: updatedApprovers,
        teams: updatedUsernames,
        powers: poles.map((power) => power.value).join(","),
      }),
    }
  )
      .then((data) => {
        if (data.message) toast.success(data.message);
        router.push(Nav.REPAIRDOC_PAGE);
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if(menubar("repairdoc")) {
      setUserWright(UserWright.Write);
    } else if(menubar("repairdoc-view")) {
      setUserWright(UserWright.Read);
    } else {
      setUserWright(UserWright.None);
    }
  }, []);

  useEffect(() => {
    fetchRepairData(Number(params.id))
      .then((response) => setData(response))
      .catch((e: Error) => {
        toast.error(`Error fetching repair data: ${e.message}`);
      });

    fetchReferenceData()
      .then((response) => setReferenceData(response))
      .catch((e: Error) => {
        toast.error(`Error fetching reference data: ${e.message}`);
      });
  }, [router, params]);

  useEffect(() => {
    if (data && data.workers) {
      setWorkers(
        data.workers.map((worker) => ({
          value: worker.username,
          label: worker.name,
          name: worker.name,
          username: worker.username,
          userData: {
            id: worker.id,
            username: worker.username,
            name: worker.name,
            position: worker.position,
            lvWork: worker.workLevel,
            lvSafe: worker.safeLevel,
            signature: worker.signature,
          },
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    if (data && data.approvers) {
      setApprovers(
        data.approvers.map((approver) => ({
          value: approver.username,
          label: approver.name,
          name: approver.name,
          username: approver.username,
          userData: {
            id: approver.id,
            username: approver.username,
            name: approver.name,
            position: approver.position,
            represent: approver.represent,
            signature: approver.signature,
          },
        }))
      );

      setSelectedRepresent(
        data.approvers.map((user) => {
          return user.represent;
        })
      );
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;
    if (!referenceData) return;

    setPoles(
      data.powers.map((power) => ({
        value: power,
        label: power,
      }))
    );

    setCurrentPowerline(String(data.powerline.id));

    setIsDataloaded(true);
  }, [data, referenceData]);

  if (!userWright) return null;

  if (userWright === UserWright.None || userWright === UserWright.Read) return <UserDontAccessPage />;

  if (!(referenceData && data && isDataloaded)) return null;

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Cập nhật phiếu sửa chữa</CardTitle>
          <CardDescription className="text-center">Chỉnh sửa thông tin phiếu sửa chữa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            create(formData)
          }} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="powerline" className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Tuyến
                </Label>
                <Input id="powerline" value={`${data.powerline.name} (${data.powerline.code})`} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Ngày sửa chữa
                </Label>
                <Input id="date" value={Moment(data.date).format("DD-MM-YYYY")} readOnly className="bg-muted" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Nhân viên sửa chữa
              </h3>
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">TT</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Chức danh</TableHead>
                      <TableHead className="text-right">Bậc thợ</TableHead>
                      <TableHead className="text-right">Bậc AT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {_.times(5, (i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>
                        <Select
                          name={`workers[${i}]`}
                          options={Object.entries(referenceData.users).map(
                            ([userId, userData]) => ({
                              value: userId,
                              label: `${userData.name} (${userData.usercode})`,
                              userData: userData as UserData,
                            })
                          )}
                          defaultValue={
                            workers[i]
                              ? {
                                  value: workers[i].username,
                                  label: `${workers[i].name} (${
                                    referenceData.users[workers[i].username]
                                      ?.usercode || ""
                                  })`,
                                  userData: referenceData.users[
                                    workers[i].username
                                  ] as UserData,
                                }
                              : null
                          }
                          onChange={(
                            selectedOption: SingleValue<UserOption> | null
                          ) => handleWorkerChange(i, selectedOption)}
                        />
                        </TableCell>
                        <TableCell>{selectedWorkers[i] ? selectedWorkers[i]?.position : workers[i]?.userData.position}</TableCell>
                        <TableCell className="text-right">{selectedWorkers[i] ? selectedWorkers[i].lv_work : workers[i]?.userData.lvWork}</TableCell>
                        <TableCell className="text-right">{selectedWorkers[i] ? selectedWorkers[i].lv_safe : workers[i]?.userData.lvSafe}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardListIcon className="w-5 h-5" />
                Công việc
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prepare" className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Biện pháp an toàn
                  </Label>
                  <Textarea id="prepare" name="prepare" defaultValue={data.prepare} className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tasks" className="text-sm font-medium flex items-center gap-2">
                    <ClipboardListIcon className="w-4 h-4" />
                    Nhiệm vụ sửa chữa
                  </Label>
                  <Textarea id="tasks" name="tasks" defaultValue={data.tasks} className="min-h-[100px]" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserPlusIcon className="w-5 h-5" />
                Ký duyệt
              </h3>
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">TT</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Chức danh</TableHead>
                      <TableHead>Vị trí ký duyệt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {_.times(3, (i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>
                        <Select
                          name={`approver[${i}]`}
                          options={Object.entries(referenceData.users).map(
                            ([userId, userData]) => ({
                              value: userId,
                              label: `${userData.name} (${userData.usercode})`,
                              userData: userData as UserData,
                            })
                          )}
                          defaultValue={
                            approvers[i]
                              ? {
                                  value: approvers[i].username,
                                  label: `${approvers[i].name} (${
                                    referenceData.users[approvers[i].username]
                                      ?.usercode || ""
                                  })`,
                                  userData: referenceData.users[
                                    approvers[i].username
                                  ] as UserData,
                                }
                              : null
                          }
                          onChange={(
                            selectedOption: SingleValue<UserOption> | null
                          ) => handleApproverChange(i, selectedOption)}
                        />
                        </TableCell>
                        <TableCell>{selectedApprovers[i] ? selectedApprovers[i].position : approvers[i]?.userData.position}</TableCell>
                        <TableCell>
                        <Select
                      name={`approverRepresent[${i}]`}
                      options={represent.map((rep) => ({
                        value: rep,
                        label: rep,
                      }))}
                      onChange={(
                        selectedOption: SingleValue<{
                          value: string;
                          label: string;
                        }> | null
                      ) => {
                        const newSelectedApprovers = [...selectedApprovers];
                        const newSelectedRepresent = [...selectedRepresent];

                        if (selectedOption) {
                          newSelectedApprovers[i].represent =
                            selectedOption.value;
                          newSelectedRepresent[i] = selectedOption.value;
                        }

                        setSelectedApprovers(newSelectedApprovers);
                        setSelectedRepresent(newSelectedRepresent);
                      }}
                      defaultValue={
                        selectedRepresent[i] !== null
                          ? {
                              value: selectedRepresent[i]!,
                              label: selectedRepresent[i]!,
                            }
                          : null
                      }
                      value={
                        selectedRepresent[i] !== null
                          ? {
                              value: selectedRepresent[i]!,
                              label: selectedRepresent[i]!,
                            }
                          : null
                      }
                    />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <div className="flex justify-between pt-6">
              <Link href={Nav.REPAIRDOC_PAGE}>
                <Button variant="outline">Quay lại</Button>
              </Link>
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}