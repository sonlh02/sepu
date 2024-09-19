'use client'

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "react-toastify"
import Link from "next/link"
import _ from "lodash"
import { format } from "date-fns"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, UserIcon, ShieldIcon, ClipboardIcon, CheckCircleIcon } from "lucide-react"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import menubar from "@/lib/menu"
import { Nav } from "@/lib/nav"
import { UserWright } from "@/enum/user_wright"
import { ReferenceData, fetchReferenceData } from "../fetch_reference_data"
import UserDontAccessPage from "@/component/NotAllow"
import Select, { SingleValue } from "react-select"

export default function NewDoc() {
  const router = useRouter()
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const represent = ["Tổ QLVH", "Đội đường dây", "Đội QL LĐCT"]
  const [route, setRoute] = useState<{ value: string; label: string } | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<(UserData | null)[]>(new Array(5).fill(null))
  const [selectedApprovers, setSelectedApprovers] = useState<Approver[]>([])

  const handleWorkerChange = (i: number, selectedOption: SingleValue<UserOption> | null) => {
    const userData = selectedOption?.userData || null;
    const newSelectedWorkers = [...selectedWorkers];
    newSelectedWorkers[i] = userData;
    setSelectedWorkers(newSelectedWorkers);
  };
  
  const handleApproverChange = (i: number, selectedOption: SingleValue<UserOption> | null) => {
    if (!referenceData || !referenceData.users) {
      return;
    }
  
    const newSelectedApprovers = [...selectedApprovers];
  
    const username = Object.keys(referenceData.users).find(
      key => referenceData.users[key].name === selectedOption?.userData.name
    ) || '';
  
    const name = selectedOption?.userData.name || '';
  
    newSelectedApprovers[i] = { 
      username, 
      name, 
      position: selectedOption?.userData.position || '', 
      represent: ''
    };
    setSelectedApprovers(newSelectedApprovers);
  };

  function create(formData: FormData) {
    const powerline = formData.get("powerline")?.toString() || ""
    const prepare = formData.get("prepare")?.toString() || ""
    const tasks = formData.get("tasks")?.toString() || ""
  
    if (!referenceData ||!date) {
      return
    }

    if (!referenceData) {
      return
    }
  
    const teamUsernames = selectedWorkers
    .filter(worker => worker !== null)
    .map(worker => {
      return Object.keys(referenceData.users).find(key => referenceData.users[key].usercode === worker?.usercode) || '';
    });

    fetchWithToken(SE.API_REPAIRDOC, {
      method: "POST",
      body: JSON.stringify({
        route_id: powerline,
        date_repair: date?.toISOString(),
        safe_measure: prepare,
        tasks: tasks,
        approver: selectedApprovers.map((approver) => ({
          username: approver.username,
          represent: approver.represent,
        })),
        teams: teamUsernames,
      }),
    })
      .then((data) => {
        if (data.message) toast.success(data.message)
        router.push(Nav.REPAIRDOC_PAGE)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  useEffect(() => {
    if(menubar("repairdoc")) {
      setUserWright(UserWright.Write)
    } else if(menubar("repairdoc-view")) {
      setUserWright(UserWright.Read)
    } else {
      setUserWright(UserWright.None)
    }

    fetchReferenceData()
      .then((response) => setReferenceData(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }, [router])

  if (!userWright) return null

  if (userWright === UserWright.None || userWright === UserWright.Read) return <UserDontAccessPage />

  if (!referenceData) return null

  type UserData = {
    phone: string;
    name: string;
    lv_work?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    position: string;
    usercode: string;
    department: string;
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

  return (
    <div className="flex flex-1 relative items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-300 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Tạo phiếu sửa chữa</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" action={create}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="powerline" className="text-sm font-medium">
                    <span className="text-destructive mr-1">*</span>
                    Tuyến
                  </Label>
                  <Select
                    name="powerline"
                    options={Object.entries(referenceData.powerlines).map(
                      ([powerlineId, powerlineData]) => ({
                        value: powerlineId,
                        label: powerlineData,
                      })
                    )}
                    onChange={(sl) => setRoute(sl)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    <span className="text-destructive mr-1">*</span>
                    Ngày sửa chữa
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                  <UserIcon className="h-5 w-5" />
                  Nhân viên sửa chữa
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">TT</th>
                        <th className="border p-2 text-left">Họ và tên</th>
                        <th className="border p-2 text-left">Chức danh</th>
                        <th className="border p-2 text-left">Bậc thợ</th>
                        <th className="border p-2 text-left">Bậc AT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {_.times(5, (i) => (
                        <tr key={i} className="even:bg-muted/50">
                          <td className="border p-2">
                          <Select
                            name={`workers[${i}]`}
                            options={Object.entries(referenceData.users).map(
                              ([userId, userData]) => ({
                              value: userId,
                              label: `${userData.name} (${userData.usercode})`,
                              userData: userData as UserData,
                            }))}
                            onChange={(selectedOption: SingleValue<UserOption> | null) => handleWorkerChange(i, selectedOption)}
                          />
                          </td>
                          <td className="border p-2">{selectedWorkers[i]?.name || ''}</td>
                          <td className="border p-2">{selectedWorkers[i]?.position || ''}</td>
                          <td className="border p-2">{selectedWorkers[i]?.lv_work}</td>
                          <td className="border p-2">{selectedWorkers[i]?.lv_safe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                  <ClipboardIcon className="h-5 w-5" />
                  Công việc
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepare" className="text-sm font-medium">Biện pháp an toàn</Label>
                    <Textarea name="prepare" className="min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tasks" className="text-sm font-medium">
                      <span className="text-destructive mr-1">*</span>
                      Nhiệm vụ sửa chữa
                    </Label>
                    <Textarea name="tasks" className="min-h-[100px]" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                  <ShieldIcon className="h-5 w-5" />
                  Ký duyệt
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">TT</th>
                        <th className="border p-2 text-left">Họ và tên</th>
                        <th className="border p-2 text-left">Chức danh</th>
                        <th className="border p-2 text-left">Vị trí ký duyệt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {_.times(3, (i) => (
                        <tr key={i} className="even:bg-muted/50">
                          <td className="border p-2">
                          <Select
                            name={`approver[${i}]`}
                            options={Object.entries(referenceData.users).map(
                              ([userId, userData]) => ({
                                value: userId,
                                label: `${userData.name} (${userData.usercode})`,
                                userData: userData as UserData
                              })
                            )}
                            onChange={(selectedOption: SingleValue<UserOption> | null) => handleApproverChange(i, selectedOption)}
                            value={Object.entries(referenceData.users).find(([userId, userData]) => userId === selectedApprovers[i]?.username) 
                              ? { 
                                  value: selectedApprovers[i]?.username, 
                                  label: `${selectedApprovers[i]?.name} (${referenceData.users[selectedApprovers[i]?.username].usercode})`,
                                  userData: referenceData.users[selectedApprovers[i]?.username] as UserData 
                                } 
                              : null}
                          />
                          </td>
                          <td className="border p-2">{selectedApprovers[i]?.name || ''}</td>
                          <td className="border p-2">{selectedApprovers[i]?.position || ''}</td>
                          <td className="border p-2">
                          <Select
                            name={`approverRepresent[${i}]`}
                            options={represent.map((rep) => ({
                              value: rep,
                              label: rep,
                            }))}
                            onChange={(selectedOption: SingleValue<{ value: string; label: string }> | null) => {
                              if (selectedOption) {
                                const newSelectedApprovers = [...selectedApprovers];
                                if (newSelectedApprovers[i]) {
                                  newSelectedApprovers[i].represent = selectedOption.value;
                                  setSelectedApprovers(newSelectedApprovers);
                                }
                              }
                            }}
                            value={represent.find(rep => rep === selectedApprovers[i]?.represent) 
                              ? { value: selectedApprovers[i]?.represent, label: selectedApprovers[i]?.represent } 
                              : null}
                          />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Link href={Nav.REPAIRDOC_PAGE}>
                  <Button variant="outline">Quay lại</Button>
                </Link>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <CheckCircleIcon className="mr-2 h-4 w-4" /> Tạo phiếu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}