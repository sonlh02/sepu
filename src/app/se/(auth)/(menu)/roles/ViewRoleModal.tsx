import { Dispatch, SetStateAction } from "react"
import { RoleData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, User, FileText, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ViewRoleModal({
  className,
  data,
  setViewingData,
}: {
  className?: string
  data: RoleData
  setViewingData: Dispatch<SetStateAction<RoleData | null>>
}) {
  return (
    <Dialog open={!!data} onOpenChange={() => setViewingData(null)}>
      <DialogContent className={`sm:max-w-[550px] ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold">Thông tin vai trò</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Tên</Label>
              <Input id="name" value={data.name} readOnly className="bg-muted font-medium" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="description" className="text-sm font-medium text-muted-foreground">Mô tả</Label>
              <Input id="description" value={data.description} readOnly className="bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <Label htmlFor="permissions" className="text-sm font-medium text-muted-foreground">Quyền</Label>
            </div>
            <ScrollArea className="h-[150px] w-full rounded-md border">
              <div className="p-4 flex flex-wrap gap-2">
                {data.items.map((item, index) => (
                  <Badge key={index} variant="secondary">{item}</Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}