import { Dispatch, SetStateAction } from "react"
import Image from "next/image"
import { X, AlertTriangle, MapPin, Calendar, Ruler } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IncidentFlyData } from "./page"

export default function ViewIncidentFlyModal({
  className,
  data,
  setViewingData,
}: {
  className?: string
  data: IncidentFlyData
  setViewingData: Dispatch<SetStateAction<IncidentFlyData | null>>
}) {
  return (
    <Dialog open={!!data} onOpenChange={() => setViewingData(null)}>
      <DialogContent className={`sm:max-w-[700px] sm:max-h-[90vh] ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Thông tin bất thường khi bay
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-muted-foreground">Mã phiếu</Label>
                <p className="text-lg font-semibold">{data.docNo}</p>
              </div>
              <Badge variant="destructive" className="text-md px-3 py-1">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Bất thường
              </Badge>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm text-muted-foreground">Tuyến</Label>
                <p className="text-lg font-medium">{data.routeCode}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Mã cột</Label>
                <p className="text-lg font-medium">{data.power.name}</p>
              </div>
            </div>
            <Card>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Vị trí:</span>
                  <span className="ml-2">
                    {Object.values(data.coordinates)[0]}, {Object.values(data.coordinates)[1]}
                  </span>
                </div>
                <div className="flex items-center">
                  <Ruler className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Độ cao:</span>
                  <span className="ml-2">{data.altitude} m</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium">Ngày cảnh báo:</span>
                  <span className="ml-2">
                    {data.dateWarning.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Mô tả bất thường</Label>
              <p className="rounded-md bg-muted p-3 text-sm">{data.incident}</p>
            </div>
            {data.path && (
              <div>
                <Label className="mb-2 block text-sm text-muted-foreground">Ảnh bất thường</Label>
                <div className="overflow-hidden rounded-lg border">
                  <Image
                    className="h-auto w-full object-cover"
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.path}`}
                    alt="Ảnh bất thường"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto', maxHeight: '300px' }}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}