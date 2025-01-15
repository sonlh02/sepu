import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Moment from "moment"
import { InspectData } from "../../doc_data"

export function VStep1({ className, inspectData }: { className?: string; inspectData: InspectData }) {
  return (
    <Card className={`border-none ${className || ""}`}>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="powerline">Tuyến</Label>
            <div id="powerline" className="p-2 bg-muted rounded-md">{inspectData.powerline}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="powerPoleFrom">Từ cột</Label>
            <div id="powerPoleFrom" className="p-2 bg-muted rounded-md">{inspectData.powerPoleFrom}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="powerPoleTo">Đến cột</Label>
            <div id="powerPoleTo" className="p-2 bg-muted rounded-md">{inspectData.powerPoleTo}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Ngày kiểm tra</Label>
            <div id="date" className="p-2 bg-muted rounded-md">{Moment(inspectData.date).format("DD-MM-YYYY")}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inspectMethod">Phương thức kiểm tra</Label>
            <div id="inspectMethod" className="p-2 bg-muted rounded-md">{inspectData.inspectMethod}</div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nhân viên kiểm tra</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">TT</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Chức danh</TableHead>
                <TableHead>Bậc thợ</TableHead>
                <TableHead>Bậc AT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectData.workers.map((worker, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.position || ''}</TableCell>
                  <TableCell>{worker.lvWork || ''}</TableCell>
                  <TableCell>{worker.lvSafe || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thiết bị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workstations">Máy trạm</Label>
              <div id="workstations" className="p-2 bg-muted rounded-md">
                {inspectData.workstations.map((workstation) => workstation.name).join(", ")}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flycams">UAV</Label>
              <div id="flycams" className="p-2 bg-muted rounded-md">
                {inspectData.flycams.map((flycam) => flycam.name).join(", ")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-4" />

        <div className="space-y-2">
          <Label>Ký duyệt</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">TT</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Chức danh</TableHead>
                <TableHead>Vị trí ký duyệt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectData.approvers.map((approver, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{approver.name}</TableCell>
                  <TableCell>{approver.position || ''}</TableCell>
                  <TableCell>{approver.represent || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}