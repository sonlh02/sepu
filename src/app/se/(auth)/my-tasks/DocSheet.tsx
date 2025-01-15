'use client'

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { InspectStatus, RepairStatus } from "@/enum/doc_status"
import { InspectType } from "@/enum/inspect_type"
import { InspectData, RepairData } from "./doc_data"

// modal
import ViewInspectModal from "./_modal/ViewInspectModal";
import ConfirmInspectModal from "./_modal/ConfirmInspectModal";
import CheckDvInspectModal from "./_modal/CheckDvModal";
import SubmitInspectModal from "./_modal/SubmitInspectModal";
import UpdateInspectModal from "./_modal/UpdateInspectModal";
import ApprovalInspectModal from "./_modal/ApprovalInspectModal";

import ViewRepairModal from "./_modal/ViewRepairModal";
import ConfirmRepairModal from "./_modal/ConfirmRepairModal";
import SubmitRepairModal from "./_modal/SubmitRepairModal";
import UpdateRepairModal from "./_modal/UpdateRepairModal";
import ApprovalRepairModal from "./_modal/ApprovalRepairModal";

export function InspectSheet({
  username,
  inspectData,
  tab,
  category,
  fetchData,
  currentPage
}: {
  username: string
  inspectData: InspectData
  tab: string
  category: string
  fetchData: Function
  currentPage: any
}) {
  const [action, setAction] = useState<string>("")
  const [isme, setIsme] = useState<boolean>(false)
  const [issign, setIssign] = useState<boolean>(false)

  useEffect(() => {
    if (category == "task" && inspectData.workers.some(user => user.username == username && user.leader == true))
      setIsme(true)

    if (category == "approval" && inspectData.approvers.some(user => user.username == username && user.confirm == true))
      setIssign(true)
  }, [category, inspectData, username])

  const statusBadge = {
    [InspectStatus.Created]: <Badge variant="outline">Phiếu mới</Badge>,
    [InspectStatus.Confirmed]: <Badge variant="confirmed">Đã xác nhận</Badge>,
    [InspectStatus.Ready]: <Badge className="bg-green-500 text-white">Thiết bị sẵn sàng</Badge>,
    [InspectStatus.Submited]: <Badge className="bg-purple-500 text-white">Đã nộp</Badge>,
    [InspectStatus.Approved]: <Badge variant="default">Đang ký duyệt</Badge>,
    [InspectStatus.Completed]: <Badge className="bg-blue-800 text-white">Đã hoàn thành</Badge>,
  }[inspectData.status]

  return (
    <Card className="w-full border border-black h-96">
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        {statusBadge}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setAction("i-view")}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <h2 className="mt-2 font-bold h-10">
          {inspectData.type === InspectType.Day ? (
            <span className="text-yellow-500">Phiếu ngày: </span>
          ) : (
            <span className="text-blue-500">Phiếu đêm: </span>
          )}
          <span className="break-all font-mono font-bold">
            <u>{inspectData.code}</u>
          </span>
          <span> ({inspectData.id})</span>
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <span className="text-gray-500">Ngày kiểm tra: </span>
            <span className="font-mono font-bold">
              {format(new Date(inspectData.date), "dd-MM-yyyy")}
            </span>
          </li>
          <li>
            <span className="text-gray-500">Tuyến: </span>
            <span className="font-mono font-bold"><u>{inspectData.powerline}</u></span>
          </li>
          <li>
            <span className="text-gray-500">Cột: </span>
            <span className="font-mono font-bold"><u>{inspectData.powerPoleFrom}</u></span>
            <span className="text-gray-500"> đến </span>
            <span className="font-mono font-bold"><u>{inspectData.powerPoleTo}</u></span>
          </li>
          <li>
            <div className="truncate">
              <span className="text-gray-500">PTKT: </span>
              <span className="font-mono font-bold">{inspectData.inspectMethod}</span>
            </div>
          </li>
          <li>
            <span className="text-gray-500">Đội thực hiện: </span>
            <div className="ml-4 h-10 truncate">
              {inspectData.workers.map((user, index) => (
                <div key={index}>- {user.name}</div>
              ))}
            </div>
          </li>
        </ul>
        
        <div className="mt-4 flex justify-center">
          {tab == "index" && category == "task" && inspectData.status === InspectStatus.Created ? (
            <Button className="bg-blue-500 text-white" onClick={() => setAction("i-confirm")}>Xác nhận</Button>
          ) : null}

          {tab == "index" && category == "task" && isme
            && inspectData.status === InspectStatus.Confirmed
            && (inspectData.workstations.length === 0 || inspectData.workstations.filter((ws) => !ws.activity).length === 0)
            && (inspectData.flycams.length === 0 || inspectData.flycams.filter((fc) => !fc.activity).length === 0) ? (
            <Button
              type="button"
              className="bg-green-500 text-white"
              onClick={() => setAction("i-checkdv")}
            >
              KT thiết bị
            </Button>
          ) : null}

          {tab == "index" && category == "task" && isme
            && inspectData.status === InspectStatus.Confirmed
            && ( (inspectData.workstations.length > 0 && inspectData.workstations.filter((ws) => !ws.activity).length > 0) 
              || (inspectData.flycams.length > 0 && inspectData.flycams.filter((fc) => !fc.activity).length > 0) ) ? (
            <div className="badge badge-info text-white p-4">
              Đợi đổi thiết bị
            </div>
          ) : null}

          {tab == "index" && category == "task" && isme
            && inspectData.status === InspectStatus.Ready ? (
            <Button
              type="button"
              className="bg-purple-500 text-white"
              onClick={() => setAction("i-submit")}
            >
              Gửi phiếu
            </Button>
          ) : null}

          {tab == "index" && category == "task" && isme
            && inspectData.status === InspectStatus.Submited ? (
            <Button
              type="button"
              className="bg-yellow-500 text-white"
              onClick={() => setAction("i-update")}
            >
              Chỉnh sửa
            </Button>
          ) : null}

          {tab == "index" && category == "task" && isme
            && inspectData.status === InspectStatus.Approved  ? (
            <div className="badge badge-warning text-white p-4">
              Chờ ký duyệt
            </div>
          ) : null}

          {tab == "index" && category == "task" && !isme
            && inspectData.status !== InspectStatus.Created  ? (
            <div className="badge badge-primary text-white p-4">
              Phiếu đang thực hiện
            </div>
          ) : null}

          {tab == "index" && category == "approval" && !issign
            && (inspectData.status === InspectStatus.Submited || inspectData.status === InspectStatus.Approved) ? (
            <div>
              <Button
                type="button"
                className="bg-yellow-500 text-white"
                onClick={() => setAction("i-update")}
              >
                Chỉnh sửa
              </Button>
              <Button
                type="button"
                className="bg-blue-800 text-white ml-4"
                onClick={() => setAction("i-approval")}
              >
                Ký duyệt
              </Button>
            </div>
          ) : null}

          {tab == "index" && category == "approval" && issign
            && inspectData.status === InspectStatus.Approved ? (
            <div className="badge badge-success text-white p-4">
              Đã duyệt
            </div>
          ) : null}
        </div>
      </CardContent>

      {action === "i-view" && (
        <ViewInspectModal
          inspectData={inspectData}
          setAction={setAction}
        />
      )}

      {action === "i-confirm" && (
        <ConfirmInspectModal
          className="modal-open"
          inspectData={inspectData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}

      {action === "i-checkdv" && (
        <CheckDvInspectModal
          className="modal-open"
          inspectData={inspectData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}

      {action === "i-submit" && (
        <SubmitInspectModal
          className="modal-open"
          inspectData={inspectData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}

      {action === "i-update" && (
        <UpdateInspectModal
          inspectData={inspectData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}

      {action === "i-approval" && (
        <ApprovalInspectModal
          className="modal-open"
          inspectData={inspectData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}
    </Card>
  )
}

export function RepairSheet({
  username,
  repairData,
  tab,
  category,
  fetchData,
  currentPage,
}: {
  username: string
  repairData: RepairData
  tab: string
  category: string
  fetchData: Function
  currentPage: any
}) {
  const [action, setAction] = useState<string>("")
  const [isme, setIsme] = useState<boolean>(false)
  const [issign, setIssign] = useState<boolean>(false)

  useEffect(() => {
    if (category == "task" && repairData.workers.some(user => user.username == username && user.leader == true))
      setIsme(true)

    if (category == "approval" && repairData.approvers.some(user => user.username == username && user.confirm == true))
      setIssign(true)
  }, [category, repairData, username])

  const statusBadge = {
    [RepairStatus.Created]: <Badge variant="outline">Phiếu mới</Badge>,
    [RepairStatus.Confirmed]: <Badge className="bg-blue-500">Đã nhận phiếu</Badge>,
    [RepairStatus.Submited]: <Badge className="bg-purple-500">Đã nộp phiếu</Badge>,
    [RepairStatus.Approved]: <Badge variant="default">Đang ký duyệt</Badge>,
    [RepairStatus.Completed]: <Badge className="bg-blue-800">Đã hoàn thành</Badge>,
  }[repairData.status]

  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        {statusBadge}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setAction("r-view")}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <h2 className="mt-2 font-bold h-10">
          <span>Phiếu sửa chữa: </span>
          <span className="break-all font-mono font-bold">
            <u>{repairData.code}</u>
          </span>
          <span> ({repairData.id})</span>
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <span className="text-gray-500">Ngày kiểm tra: </span>
            <span className="font-mono font-bold">
              {format(new Date(repairData.date), "dd-MM-yyyy")}
            </span>
          </li>
          <li>
            <span className="text-gray-500">Tuyến: </span>
            <span className="font-mono font-bold"><u>{repairData.powerline}</u></span>
          </li>
          <li>
            <span className="text-gray-500">Đội thực hiện: </span>
            <div className="ml-4 h-10 truncate">
              {repairData.workers.map((user, index) => (
                <div key={index}>- {user.name}</div>
              ))}
            </div>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {tab == "index" && category == "task" && repairData.status === RepairStatus.Created && (
          <Button onClick={() => setAction("r-confirm")} className="w-full bg-blue-500">Xác nhận</Button>
        )}

        {tab == "index" && category == "task" && isme && repairData.status === RepairStatus.Confirmed && (
          <Button onClick={() => setAction("r-submit")} className="w-full bg-purple-500">Gửi phiếu</Button>
        )}

        {tab == "index" && category == "task" && isme && repairData.status === RepairStatus.Submited && (
          <Button onClick={() => setAction("r-update")} className="w-full bg-yellow-500">Chỉnh sửa</Button>
        )}

        {tab == "index" && category == "task" && isme && repairData.status === RepairStatus.Approved && (
          <Badge variant="default" className="w-full justify-center">Chờ ký duyệt</Badge>
        )}

        {tab == "index" && category == "task" && !isme && repairData.status !== RepairStatus.Created && (
          <Badge variant="destructive" className="w-full justify-center">Phiếu đang thực hiện</Badge>
        )}

        {tab == "index" && category == "approval" && !issign &&
         (repairData.status === RepairStatus.Submited || repairData.status === RepairStatus.Approved) && (
          <div className="flex gap-2 w-full">
            <Button onClick={() => setAction("r-update")} className="flex-1 bg-yellow-500">Chỉnh sửa</Button>
            <Button onClick={() => setAction("r-approval")} className="flex-1 bg-blue-800">Ký duyệt</Button>
          </div>
        )}

        {tab == "index" && category == "approval" && issign && repairData.status === RepairStatus.Approved && (
          <Badge variant="outline" className="w-full justify-center">Đã duyệt</Badge>
        )}
      </CardFooter>

      {action === "r-view" && (
        <ViewRepairModal
          repairData={repairData}
          setAction={setAction}
        />
      )}

      {action === "r-confirm" && (
        <ConfirmRepairModal
          repairData={repairData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}

      {action === "r-submit" && (
        <SubmitRepairModal
          repairData={repairData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}

      {action === "r-update" && (
        <UpdateRepairModal
          repairData={repairData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}

      {action === "r-approval" && (
        <ApprovalRepairModal
          repairData={repairData}
          setAction={setAction}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}
    </Card>
  )
}