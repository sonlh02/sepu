"use client"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "react-toastify"
import Link from "next/link"
import Moment from "moment"
import _ from "lodash"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import menubar from "@/lib/menu"
import { Nav } from "@/lib/nav"
import { UserWright } from "@/enum/user_wright"
import { InspectType } from "@/enum/inspect_type"
import { InspectData } from "../../inspect_data"
import { fetchInspectData } from "../../fetch_inspect_data"
import { ReferenceData, fetchReferenceData } from "../../fetch_reference_data"

import UserDontAccessPage from "@/component/NotAllow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { SingleValue } from "react-select"
import { Checkbox } from "@/components/ui/checkbox"

type UserData = {
  username: string;
  phone: string;
  name: string;
  lv_work?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  position: string;
  usercode: string;
  department: string;
  lv_safe?: 1 | 2 | 3 | 4 | 5;
  represent: string;
};

type UserOption = {
  value: string;
  label: string;
  userData: UserData;
};

type Approver = {
  username: string;
  name: string;
  position: string;
  represent: string;
};

export default function EditDoc({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [data, setData] = useState<InspectData | null>()
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [date, setDate] = useState(new Date())
  const represent = ["Tổ QLVH", "Đội đường dây", "Đội QL LĐCT"]
  const [approvers, setApprovers] = useState<Array<{
    value: string
    label: string
    name: string
    userData: {
      id: number
      username: string
      name: string
      position: string
      represent: string
      signature?: string
    }
    username: string
  }>>([])
  const [workers, setWorkers] = useState<Array<{
    value: string
    label: string
    name: string
    userData: {
      id: number
      username: string
      name: string
      position: string
      lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7
      lvSafe: 1 | 2 | 3 | 4 | 5
      signature?: string
    }
    username: string
  }>>([])
  const [workstations, setWorkstations] = useState<Array<{ value: string; label: string }>>([])
  const [flycams, setFlycams] = useState<Array<{ value: string; label: string }>>([])
  const [isDataloaded, setIsDataloaded] = useState(false)
  const [selectedWorkers, setSelectedWorkers] = useState<(UserData | null)[]>(new Array(5).fill(null))
  const [selectedApprovers, setSelectedApprovers] = useState<Approver[]>([])
  const [selectedRepresent, setSelectedRepresent] = useState<(string | null)[]>(Array(3).fill(null))
  const [selectedWorkstations, setSelectedWorkstations] = useState<string[]>([])
  const [selectedFlycams, setSelectedFlycams] = useState<string[]>([])

  const handleWorkerChange = (
    i: number,
    selectedOption: UserOption | null
  ) => {
    const userData = selectedOption?.userData || null;
    const newSelectedWorkers = [...selectedWorkers];
    newSelectedWorkers[i] = userData;
    setSelectedWorkers(newSelectedWorkers);
  };

  const handleApproverChange = (
    index: number,
    selectedOption: UserOption
  ) => {
    const newSelectedApprovers = [...selectedApprovers];
    const newSelectedRepresent = [...selectedRepresent];

    if (selectedOption) {
      if (
        !approvers[index] || // If there's no old data
        approvers[index].username !== selectedOption.value // If the user changed the approver
      ) {
        // Reset the represent value to empty
        newSelectedRepresent[index] = null;
      } else {
        // Keep the represent value from the old data
        newSelectedRepresent[index] = approvers[index].userData.represent || "";
      }

      newSelectedApprovers[index] = {
        username: selectedOption.value,
        name: selectedOption.userData.name,
        position: selectedOption.userData.position,
        represent: newSelectedRepresent[index] || "", // Keep represent if not changed
      };
    } else {
      // If no option is selected, reset the data
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

  const handleWorkstationChange = (checked: boolean, value: string) => {
    setSelectedWorkstations(prev => 
      checked ? [...prev, value] : prev.filter(item => item !== value)
    )
  }

  const handleFlycamChange = (checked: boolean, value: string) => {
    setSelectedFlycams(prev => 
      checked ? [...prev, value] : prev.filter(item => item !== value)
    )
  }

  function create(formData: FormData) {
    if (!data || !referenceData) return;

    const inspectMethod = formData.get("inspectMethod")?.toString() || "";

    if (!referenceData) {
      return;
    }

    //Sửa nhân viên kiểm tra
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
        // Luôn cập nhật dòng với dữ liệu mới
        approverMap.set(index, {
          username: approver.username,
          represent: approver.represent || "",
        });
      }
    });

    // Chuyển Map thành mảng các đối tượng
    const updatedApprovers = Array.from(approverMap.values());

    fetchWithToken(
      `${SE.API_INSPECTDOC}/${params.id}`, 
      {
      method: "PUT",
      body: JSON.stringify({
        method_inspect: inspectMethod,
        approver: updatedApprovers,
        teams: updatedUsernames,
        workstation: workstations.length > 0 ? workstations.map((workstation) => workstation.value) : [],
        flycam: flycams.length > 0 ? flycams.map((flycam) => flycam.value) : [],
      }),
    }
    )
      .then((data) => {
        if (data.message) toast.success(data.message);
        router.push(Nav.INSPECTDOC_PAGE);
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if(menubar("inspectdoc")) {
      setUserWright(UserWright.Write);
    } else if(menubar("inspectdoc-view")) {
      setUserWright(UserWright.Read);
    } else {
      setUserWright(UserWright.None);
    }
  }, []);

  useEffect(() => {
    fetchInspectData(Number(params.id))
      .then((response) => setData(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });

    fetchReferenceData()
      .then((response) => setReferenceData(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }, [params]);

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
            lvWork: worker.lvWork,
            lvSafe: worker.lvSafe,
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

    setWorkstations(
      data.workstations.map((workstation) => ({
        value: String(workstation.id),
        label: referenceData.workstations[workstation.id],
      }))
    );

    setFlycams(
      data.flycams.map((flycam) => ({
        value: String(flycam.id),
        label: referenceData.flycams[flycam.id],
      }))
    );

    setIsDataloaded(true);
  }, [data, referenceData]);

  useEffect(() => {
    if (data && referenceData) {
      setSelectedWorkstations(
        data.workstations.map((workstation) => String(workstation.id))
      );

      setSelectedFlycams(
        data.flycams.map((flycam) => String(flycam.id))
      );

      setIsDataloaded(true);
    }
  }, [data, referenceData]);

  if (!userWright) return null
  if (userWright === UserWright.None || userWright === UserWright.Read) return <UserDontAccessPage />
  if (!(referenceData && data && isDataloaded)) return null

  return (
    <div className="container mx-auto py-10">
      <form className="space-y-8" action={create}>
      <h1 className="text-center text-3xl font-bold mb-6">
          Sửa phiếu kiểm tra {
            {
              [InspectType.Day]: "ngày",
              [InspectType.Night]: "đêm",
            }[data.type]
          }
        </h1>

        <Card className="mb-6">
          <CardContent className="grid gap-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tuyến</Label>
                <Input value={`${data.powerline.name} (${data.powerline.code})`} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Từ cột</Label>
                <Input value={`${data.powerPoles.from.name} (${data.powerPoles.from.code})`} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Đến cột</Label>
                <Input value={`${data.powerPoles.to.name} (${data.powerPoles.to.code})`} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày kiểm tra</Label>
                <Input value={Moment(data.date).format("DD-MM-YYYY")} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspectMethod">Phương thức kiểm tra</Label>
                <Input
                  id="inspectMethod"
                  name="inspectMethod"
                  defaultValue={data.inspectMethod}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Label className="mb-2 block">Nhân viên kiểm tra</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TT</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Chức danh</TableHead>
                  <TableHead>Bậc thợ</TableHead>
                  <TableHead>Bậc AT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {_.times(5, (i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Select
                        name={`workers[${i}]`}
                        onValueChange={(value) => {
                          const selectedUser = referenceData.users[value];
                          handleWorkerChange(i, {
                            value,
                            label: `${selectedUser.name} (${selectedUser.usercode})`,
                            userData: {
                              username: value,
                              phone: selectedUser.phone,
                              name: selectedUser.name,
                              lv_work: selectedUser.lv_work,
                              position: selectedUser.position || '',
                              usercode: selectedUser.usercode,
                              department: selectedUser.department || '',
                              lv_safe: selectedUser.lv_safe,
                              represent: '', // We set this to an empty string as it's not present in selectedUser
                            },
                          });
                        }}
                        defaultValue={workers[i]?.username}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select worker" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(referenceData.users).map(([userId, userData]) => (
                            <SelectItem key={userId} value={userId}>
                              {`${userData.name} (${userData.usercode})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{selectedWorkers[i]?.name || workers[i]?.label || ""}</TableCell>
                    <TableCell>{selectedWorkers[i]?.position || workers[i]?.userData.position}</TableCell>
                    <TableCell>{selectedWorkers[i]?.lv_work || workers[i]?.userData.lvWork}</TableCell>
                    <TableCell>{selectedWorkers[i]?.lv_safe || workers[i]?.userData.lvSafe}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thiết bị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Máy trạm</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(referenceData.workstations).map(([workstationId, workstationName]) => (
                  <div key={workstationId} className="flex items-center space-x-2">
                    <Checkbox
                      id={`workstation-${workstationId}`}
                      checked={selectedWorkstations.includes(workstationId)}
                      onCheckedChange={(checked) => handleWorkstationChange(checked as boolean, workstationId)}
                    />
                    <Label htmlFor={`workstation-${workstationId}`}>{workstationName}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>UAV</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(referenceData.flycams).map(([flycamId, flycamName]) => (
                  <div key={flycamId} className="flex items-center space-x-2">
                    <Checkbox
                      id={`flycam-${flycamId}`}
                      checked={selectedFlycams.includes(flycamId)}
                      onCheckedChange={(checked) => handleFlycamChange(checked as boolean, flycamId)}
                    />
                    <Label htmlFor={`flycam-${flycamId}`}>{flycamName}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ký duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TT</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Chức danh</TableHead>
                  <TableHead>Vị trí ký duyệt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {_.times(3, (i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Select
                        name={`approver[${i}]`}
                        onValueChange={(value) => {
                          const userData = referenceData.users[value];
                          handleApproverChange(i, {
                            value,
                            label: `${userData.name} (${userData.usercode})`,
                            userData: {
                              username: value,
                              phone: userData.phone,
                              name: userData.name,
                              lv_work: userData.lv_work,
                              position: userData.position || '',
                              usercode: userData.usercode,
                              department: userData.department || '',
                              lv_safe: userData.lv_safe,
                              represent: '', // We set this to an empty string as it's not present in userData
                            },
                          });
                        }}
                        defaultValue={approvers[i]?.username}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người ký duyệt" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(referenceData.users).map(([userId, userData]) => (
                            <SelectItem key={userId} value={userId}>
                              {`${userData.name} (${userData.usercode})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{selectedApprovers[i]?.name || approvers[i]?.name || ""}</TableCell>
                    <TableCell>{selectedApprovers[i]?.position || approvers[i]?.userData.position || ""}</TableCell>
                    <TableCell>
                      <Select
                        name={`approverRepresent[${i}]`}
                        onValueChange={(value) => {
                          const newSelectedApprovers = [...selectedApprovers];
                          const newSelectedRepresent = [...selectedRepresent];
                          newSelectedApprovers[i].represent = value;
                          newSelectedRepresent[i] = value;
                          setSelectedApprovers(newSelectedApprovers);
                          setSelectedRepresent(newSelectedRepresent);
                        }}
                        defaultValue={selectedRepresent[i] || undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                          {represent.map((rep) => (
                            <SelectItem key={rep} value={rep}>
                              {rep}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button type="submit" className="btn-primary">Cập nhật</Button>
          <Button variant="destructive" asChild>
            <Link href={Nav.INSPECTDOC_PAGE}>Quay lại</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}