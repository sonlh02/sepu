"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { DeviceData } from "./page"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"

export default function EditWorkstationModal({
  data,
  setEditingData,
  fetchData,
  params,
  limit,
  currentPage
}: {
  data: DeviceData
  setEditingData: Dispatch<SetStateAction<DeviceData | null>>
  fetchData: Function
  params: any
  limit: number
  currentPage: number
}) {
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    data.purchaseDate ? new Date(data.purchaseDate) : undefined
  )
  const [activity, setActivity] = useState(data.activity)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name")?.toString() || ""
    const code = formData.get("code")?.toString() || ""
    const wsCode = formData.get("wsCode")?.toString() || ""
    const wssKey = formData.get("wssKey")?.toString() || ""
    const note = formData.get("note")?.toString() || ""

    fetchWithToken(
      `${SE.API_WORKSTATION}/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: name,
          code: code,
          date_buy: purchaseDate?.toISOString(),
          wscode: wsCode,
          wsskey: wssKey,
          activity: activity,
          note: note,
        }),
      }
    )
      .then((data) => {
        if (data.message) toast.success(data.message)
        setEditingData(null)
        fetchData(params, limit, currentPage)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  return (
    <Dialog open={true} onOpenChange={() => setEditingData(null)}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Sửa máy trạm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="grid gap-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Tên thiết bị <span className="text-destructive">*</span>
                  </Label>
                  <Input id="name" name="name" defaultValue={data.name} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Mã code <span className="text-destructive">*</span>
                  </Label>
                  <Input id="code" name="code" defaultValue={data.code} required className="bg-background" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-sm font-medium">Ngày mua</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !purchaseDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {purchaseDate ? format(purchaseDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={purchaseDate}
                      onSelect={setPurchaseDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wsCode" className="text-sm font-medium">
                    wscode <span className="text-destructive">*</span>
                  </Label>
                  <Input id="wsCode" name="wsCode" defaultValue={data.wsCode} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wssKey" className="text-sm font-medium">
                    wsskey <span className="text-destructive">*</span>
                  </Label>
                  <Input id="wssKey" name="wssKey" defaultValue={data.wssKey} required className="bg-background" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="activity" className="text-sm font-medium">Trạng thái hoạt động</Label>
                <Switch
                  id="activity"
                  checked={activity}
                  onCheckedChange={setActivity}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-medium">Ghi chú</Label>
                <Textarea id="note" name="note" defaultValue={data.note} className="bg-background" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">Cập nhật</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}