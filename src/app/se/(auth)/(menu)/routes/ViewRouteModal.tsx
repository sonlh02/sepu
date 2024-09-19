import { Dispatch, SetStateAction } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Assuming PowerlineData is imported from another file
import { PowerlineData } from "./page"

export default function ViewRouteModal({
  className,
  data,
  setViewingData,
}: {
  className?: string
  data: PowerlineData
  setViewingData: Dispatch<SetStateAction<PowerlineData | null>>
}) {
  return (
    <Dialog open={!!data} onOpenChange={() => setViewingData(null)}>
      <DialogContent className={`sm:max-w-[600px] ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Thông tin tuyến</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên tuyến
            </Label>
            <Input id="name" value={data.name} className="col-span-4" readOnly />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Mã tuyến
            </Label>
            <Input id="code" value={data.code} className="col-span-4" readOnly />
          </div>
          <div className="grid grid-cols-5 items-start gap-4">
            <Label htmlFor="note" className="text-right pt-2">
              Ghi chú
            </Label>
            <Textarea id="note" value={data.note} className="col-span-4 min-h-[100px]" readOnly />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}