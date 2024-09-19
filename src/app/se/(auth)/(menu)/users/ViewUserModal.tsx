import { Dispatch, SetStateAction } from "react"
import { Gender } from "@/enum/gender"
import { UserData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, User, Phone, Mail, Building, Briefcase, Shield, Activity, Award } from "lucide-react"

interface ViewUserModalProps {
  className?: string
  data: UserData
  setViewingData: Dispatch<SetStateAction<UserData | null>>
}

export default function ViewUserModal({ className, data, setViewingData }: ViewUserModalProps) {
  return (
    <Dialog open={!!data} onOpenChange={() => setViewingData(null)}>
      <DialogContent className={`sm:max-w-[600px] ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold">Thông tin người dùng</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={<User className="h-5 w-5" />} label="Tên" value={data.displayName} />
                  <InfoItem icon={<User className="h-5 w-5" />} label="User code" value={data.usercode} />
                  <InfoItem icon={<Phone className="h-5 w-5" />} label="Số điện thoại" value={data.phone} />
                  <InfoItem icon={<Mail className="h-5 w-5" />} label="Email" value={data.email} />
                  <InfoItem
                    icon={<User className="h-5 w-5" />}
                    label="Giới tính"
                    value={{
                      [Gender.Male]: "Nam",
                      [Gender.Female]: "Nữ",
                    }[data.gender]}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={<Building className="h-5 w-5" />} label="Phòng ban / Đơn vị" value={data.department} />
                  <InfoItem icon={<Briefcase className="h-5 w-5" />} label="Vị trí" value={data.position} />
                  <InfoItem icon={<Shield className="h-5 w-5" />} label="Quyền / Vai trò" value={data.role.name} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <Label>Trạng thái</Label>
                  </div>
                  <Badge variant={data.activity ? "default" : "destructive"}>
                    {data.activity ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <Label>Hiển thị dữ liệu</Label>
                  </div>
                  <Badge variant={data.level ? "default" : "secondary"}>
                    {data.level ? 'Có' : 'Không'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Cấp bậc</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Bậc thợ</Label>
                      <Badge variant="outline">{data.workLevel ? `${data.workLevel}/7` : "N/A"}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label>Bậc an toàn</Label>
                      <Badge variant="outline">{data.safeLevel ? `${data.safeLevel}/5` : "N/A"}</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2">
        {icon}
        <Label className="text-sm text-muted-foreground">{label}</Label>
      </div>
      <Input value={value} readOnly className="bg-muted" />
    </div>
  )
}