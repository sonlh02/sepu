'use client'

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "react-toastify"
import Link from "next/link"
import _ from "lodash"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePicker } from "@/components/ui/date-picker"
import { MultiSelect, OptionType } from "@/components/ui/multi-select"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import menubar from "@/lib/menu"
import { Nav } from "@/lib/nav"
import { UserWright } from "@/enum/user_wright"
import { InspectType } from "@/enum/inspect_type"
import { ReferenceData, fetchReferenceData } from "../fetch_reference_data"
import UserDontAccessPage from "@/component/NotAllow"
import { ReferencePowerData, fetchReferencePowerData } from "../fetch_reference_power_data"
import { SingleValue } from "react-select"

type UserData = {
  phone: string;
  name: string;
  lv_work?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  position: string;
  usercode: string;
  department?: string;
  lv_safe?: 1 | 2 | 3 | 4 | 5;
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


export default function NewDocForm({ inspectType }: { inspectType: InspectType }) {
  const router = useRouter()
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [powerPoles, setPowerPoles] = useState<{ [key: string]: string }>({})
  const [date, setDate] = useState(new Date())
  const represent = ["Tổ QLVH", "Đội đường dây", "Đội QL LĐCT"]

  const [workstations, setWorkstations] = useState<OptionType[]>([]);
  const [flycams, setFlycams] = useState<Array<{ value: string; label: string }>>([])
  const [route, setRoute] = useState<{ id: string; value: string; label: string } | null>(null);
  const [spower, setSpower] = useState<{ value: string; label: string } | null>(null);
  const [epower, setEpower] = useState<{ value: string; label: string } | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<(UserData | null)[]>(new Array(5).fill(null))
  const [selectedApprovers, setSelectedApprovers] = useState<Approver[]>([])

  const handleWorkerChange = (
    i: number,
    selectedOption: { value: string; label: string; userData: Partial<UserData> } | null
  ) => {
    if (selectedOption) {
      const { userData } = selectedOption;
      const newSelectedWorkers = [...selectedWorkers];
      newSelectedWorkers[i] = {
        phone: userData.phone || '',
        name: userData.name || '',
        lv_work: userData.lv_work,
        position: userData.position || '', // Provide a default empty string
        usercode: userData.usercode || '',
        department: userData.department || '',
        lv_safe: userData.lv_safe,
      };
      setSelectedWorkers(newSelectedWorkers);
    }
  };

  const handleApproverChange = (
    i: number,
    selectedOption: { value: string; label: string; userData: UserData } | null
  ) => {
    if (!referenceData || !referenceData.users || !selectedOption) {
      return;
    }
  
    const newSelectedApprovers = [...selectedApprovers];
    const { userData } = selectedOption;
  
    const username = Object.keys(referenceData.users).find(
      (key) => referenceData.users[key].name === userData.name
    ) || '';
  
    newSelectedApprovers[i] = {
      username,
      name: userData.name,
      position: userData.position,
      represent: '',
    };
    setSelectedApprovers(newSelectedApprovers);
  };

  function create(formData: FormData) {
    const powerline = formData.get("powerline")?.toString() || "";
    const powerPoleFrom = formData.get("powerPoleFrom")?.toString() || "";
    const powerPoleTo = formData.get("powerPoleTo")?.toString() || "";
    const inspectMethod = formData.get("inspectMethod")?.toString() || "";

    if (!referenceData) {
      return;
    }

    const teamUsernames = selectedWorkers
      .filter((worker) => worker !== null)
      .map((worker) => {
        return (
          Object.keys(referenceData.users).find(
            (key) => referenceData.users[key].usercode === worker?.usercode
          ) || ""
        );
      });

    fetchWithToken(SE.API_INSPECTDOC, 
      {
      method: "POST",
      body: JSON.stringify({
        type: {
          [InspectType.Day]: "D",
          [InspectType.Night]: "N",
        }[inspectType],
        route_id: powerline,
        power_from: powerPoleFrom,
        power_to: powerPoleTo,
        method_inspect: inspectMethod,
        date_inspect: date.toISOString(),
        approver: selectedApprovers.map((approver) => ({
          username: approver.username,
          represent: approver.represent,
        })),
        teams: teamUsernames,
        workstation: workstations.map((ws) => ws.value),
        flycam: flycams.map((fc) => fc.value),
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

    fetchReferenceData()
      .then((response) => setReferenceData(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }, []);

  useEffect(() => {
    if (route) {
      fetchReferencePowerData(route.id)
        .then((data) => setPowerPoles(data.powers))
        .catch((e: Error) => {
          if (e.message) toast.error(e.message);
        });
    } else {
      setPowerPoles({});
    }
  }, [route]);

  if (!userWright) return null
  if (userWright === UserWright.None || userWright === UserWright.Read) return <UserDontAccessPage />
  if (!referenceData) return null

  return (
    <div className="flex flex-1 relative items-center justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            Tạo phiếu kiểm tra {
              {
                [InspectType.Day]: "ngày",
                [InspectType.Night]: "đêm",
              }[inspectType]
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); create(new FormData(e.target as HTMLFormElement)) }}>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="powerline">
                  <span className="text-destructive mr-1">*</span>
                  Tuyến
                </Label>
                <Select
                  onValueChange={(value) => {
                    setRoute({
                      id: value,
                      value: value,
                      label: referenceData.powerlines[value]
                    });
                    setEpower(null);
                    setSpower(null);
                  }}
                  value={route?.id || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tuyến" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(referenceData.powerlines).map(([powerlineId, powerlineData]) => (
                      <SelectItem key={powerlineId} value={powerlineId}>{powerlineData}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerPoleFrom">
                  <span className="text-destructive mr-1">*</span>
                  Từ cột
                </Label>
                <Select 
                  onValueChange={(value) => setSpower({ value, label: powerPoles[value] })} 
                  disabled={Object.keys(powerPoles).length === 0}
                  value={spower?.value || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cột" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(powerPoles).map(([powerPoleId, powerPoleName]) => (
                      <SelectItem key={powerPoleId} value={powerPoleId}>{powerPoleName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerPoleTo">
                  <span className="text-destructive mr-1">*</span>
                  Đến cột
                </Label>
                <Select 
                  onValueChange={(value) => setEpower({ value, label: powerPoles[value] })} 
                  disabled={Object.keys(powerPoles).length === 0}
                  value={epower?.value || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cột" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(powerPoles).map(([powerPoleId, powerPoleName]) => (
                      <SelectItem key={powerPoleId} value={powerPoleId}>{powerPoleName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  <span className="text-destructive mr-1">*</span>
                  Ngày kiểm tra
                </Label>
                <DatePicker date={date} setDate={setDate} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectMethod">
                  <span className="text-destructive mr-1">*</span>
                  Phương thức kiểm tra
                </Label>
                <Input id="inspectMethod" name="inspectMethod" />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>
                <span className="text-destructive mr-1">*</span>
                Nhân viên kiểm tra
              </Label>
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
                        <Select onValueChange={(value) => handleWorkerChange(i, { value, label: referenceData.users[value].name, userData: referenceData.users[value] })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhân viên" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(referenceData.users).map(([userId, userData]) => (
                              <SelectItem key={userId} value={userId}>{`${userData.name} (${userData.usercode})`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{selectedWorkers[i]?.name || ""}</TableCell>
                      <TableCell>{selectedWorkers[i]?.position || ""}</TableCell>
                      <TableCell>{selectedWorkers[i]?.lv_work}</TableCell>
                      <TableCell>{selectedWorkers[i]?.lv_safe}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Equipment Section */}
            <Card className="mt-5">
              <CardHeader>
                <CardTitle>Thiết bị</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workstation">Máy trạm</Label>
                    <MultiSelect
                      id="workstation"
                      options={Object.entries(referenceData.workstations || {}).map(
                        ([workstationId, workstationName]) => ({
                          value: workstationId,
                          label: workstationName,
                        })
                      )}
                      selected={workstations}
                      onChange={(selected) => setWorkstations(selected)}
                      placeholder="Chọn máy trạm..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flycam">UAV</Label>
                    <MultiSelect
                      id="flycam"
                      options={Object.entries(referenceData.flycams || {}).map(
                        ([flycamId, flycamName]) => ({
                          value: flycamId,
                          label: flycamName,
                        })
                      )}
                      selected={flycams}
                      onChange={(selected) => setFlycams(selected)}
                      placeholder="Chọn UAV..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Section */}
            <Card className="mt-5">
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
                          onValueChange={(value) => {
                            const userData = referenceData.users[value];
                            handleApproverChange(i, { 
                              value, 
                              label: `${userData.name} (${userData.usercode})`,
                              userData: {
                                phone: userData.phone,
                                name: userData.name,
                                lv_work: userData.lv_work,
                                position: userData.position || '',
                                usercode: userData.usercode,
                                department: userData.department,
                                lv_safe: userData.lv_safe
                              }
                            });
                          }}
                          value={selectedApprovers[i]?.username || ''}
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
                        <TableCell>{selectedApprovers[i]?.name || ""}</TableCell>
                        <TableCell>{selectedApprovers[i]?.position || ""}</TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => {
                              const newSelectedApprovers = [...selectedApprovers];
                              if (newSelectedApprovers[i]) {
                                newSelectedApprovers[i].represent = value;
                                setSelectedApprovers(newSelectedApprovers);
                              }
                            }}
                            value={selectedApprovers[i]?.represent || ''}
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

            <div className="flex justify-between mt-6">
              <Button type="submit" className="flex-1">Tạo phiếu</Button>
              <Button variant="destructive" asChild>
                <Link href={Nav.INSPECTDOC_PAGE}>Quay lại</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}