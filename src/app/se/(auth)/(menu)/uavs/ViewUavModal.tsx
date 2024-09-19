import { Dispatch, SetStateAction } from "react"
import Moment from "moment"
import { Plane, Barcode, Calendar, Activity, FileText, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DeviceData } from "./page"

export default function ViewUavModal({
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
      <DialogContent className={`sm:max-w-[525px] ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Thông tin thiết bị bay
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{data.name}</h3>
                <p className="text-sm text-muted-foreground">{data.code}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[100px_1fr] gap-4">
              <div className="flex items-center space-x-2 font-medium">
                <Barcode className="h-4 w-4 text-muted-foreground" />
                <span>Mã code</span>
              </div>
              <div>{data.code}</div>
              
              <div className="flex items-center space-x-2 font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Ngày mua</span>
              </div>
              <div>{Moment(data.purchaseDate).format("DD-MM-YYYY")}</div>
              
              <div className="flex items-center space-x-2 font-medium">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>Trạng thái</span>
              </div>
              <div>
                {data.activity ? (
                  <Badge variant="default">Hoạt động</Badge>
                ) : (
                  <Badge variant="destructive">Không hoạt động</Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Ghi chú</span>
              </div>
              <div className="text-sm">{data.note || "Không có ghi chú"}</div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}