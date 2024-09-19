import { Dispatch, SetStateAction } from "react"
import Moment from "moment"
import { DeviceData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Monitor, Barcode, Calendar, Code, Key, FileText } from "lucide-react"

export default function ViewWorkstationModal({
  className,
  data,
  setViewingData,
}: {
  className?: string
  data: DeviceData
  setViewingData: Dispatch<SetStateAction<DeviceData | null>>
}) {
  return (
    <Dialog open={!!data} onOpenChange={() => setViewingData(null)}>
      <DialogContent className={`sm:max-w-[550px] ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold">Thông tin máy trạm</DialogTitle>
        </DialogHeader>
        <Card className="border-none shadow-none">
          <CardContent className="grid gap-6 pt-6">
            <div className="grid grid-cols-[24px_1fr] items-center gap-4">
              <Monitor className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">Tên thiết bị</p>
                <p className="text-sm text-muted-foreground">{data.name}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[24px_1fr] items-center gap-4">
              <Barcode className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">Mã code</p>
                <p className="text-sm text-muted-foreground">{data.code}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[24px_1fr] items-center gap-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">Ngày mua</p>
                <p className="text-sm text-muted-foreground">{Moment(data.purchaseDate).format("DD-MM-YYYY")}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[24px_1fr] items-center gap-4">
              <Code className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">WS code</p>
                <p className="text-sm text-muted-foreground">{data.wsCode}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[24px_1fr] items-center gap-4">
              <Key className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">WSS key</p>
                <p className="text-sm text-muted-foreground">{data.wssKey}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[24px_1fr] items-center gap-4">
              <div className="flex h-6 w-6 items-center justify-center">
                <div className={`h-3 w-3 rounded-full ${data.activity ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Trạng thái</p>
                <Badge variant={data.activity ? "default" : "destructive"} className="mt-1">
                  {data.activity ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[24px_1fr] items-start gap-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">Ghi chú</p>
                <p className="text-sm text-muted-foreground">{data.note || "Không có ghi chú"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}