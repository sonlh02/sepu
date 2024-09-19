import { Dispatch, SetStateAction } from "react"
import { Status } from "@/enum/status"
import { PowerPoleData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { X } from "lucide-react"

export default function ViewPowerModal({
  data,
  setViewingData,
}: {
  data: PowerPoleData;
  setViewingData: Dispatch<SetStateAction<PowerPoleData | null>>;
}) {
  return (
    <Dialog open={!!data} onOpenChange={() => setViewingData(null)}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Thông tin cột</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên cột</Label>
              <Input className="h-auto" id="name" value={data.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Mã cột</Label>
              <Input className="h-auto" id="code" value={data.code} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Vĩ độ</Label>
              <Input className="h-auto" id="latitude" value={Object.values(data.coordinates)[1]} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Kinh độ</Label>
              <Input className="h-auto" id="longitude" value={Object.values(data.coordinates)[0]} readOnly />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity">Trạng thái</Label>
              <Input
                className="h-auto"
                id="activity"
                value={{
                  [Status.Okay]: "Bình thường",
                  [Status.Warning]: "Cảnh báo",
                  [Status.Error]: "Báo động",
                }[data.activity]}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Cột nối tiếp</Label>
              <Input className="h-auto" id="origin" value={data.origin} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea id="note" value={data.note} readOnly />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Thiết bị</Label>
          <Table>
            <TableBody>
              {Object.entries(data.items).map(([itemId, itemData]) => (
                <TableRow key={itemId}>
                  <TableCell className="font-medium">{itemData.name}</TableCell>
                  <TableCell>
                    {{
                      [Status.Okay]: "Bình thường",
                      [Status.Warning]: "Cảnh báo",
                      [Status.Error]: "Báo động",
                    }[itemData.status]}
                  </TableCell>
                  <TableCell>{itemData.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}