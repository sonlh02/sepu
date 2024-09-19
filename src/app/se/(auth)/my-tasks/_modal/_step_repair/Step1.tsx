import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { RepairData } from "../../doc_data"

export function VStep1({ repairData }: { repairData: RepairData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin sửa chữa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium">Tuyến</h3>
              <p className="text-sm text-muted-foreground">{repairData.powerline}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Ngày sửa chữa</h3>
              <p className="text-sm text-muted-foreground">{format(new Date(repairData.date), "dd-MM-yyyy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nhân viên sửa chữa</CardTitle>
        </CardHeader>
        <CardContent>
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
              {repairData.workers.map((worker, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.position || '-'}</TableCell>
                  <TableCell>{worker.lvWork || '-'}</TableCell>
                  <TableCell>{worker.lvSafe || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Công việc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Biện pháp an toàn</h3>
            <p className="text-sm text-muted-foreground">{repairData.prepare}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Nhiệm vụ sửa chữa</h3>
            <p className="text-sm text-muted-foreground">{repairData.tasks}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Danh sách cột sửa chữa</h3>
            <p className="text-sm text-muted-foreground">{repairData.powers?.split(",").join(", ")}</p>
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
                <TableHead className="w-[50px]">TT</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Chức danh</TableHead>
                <TableHead>Vị trí ký duyệt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairData.approvers.map((approver, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{approver.name}</TableCell>
                  <TableCell>{approver.position || '-'}</TableCell>
                  <TableCell>{approver.represent || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}