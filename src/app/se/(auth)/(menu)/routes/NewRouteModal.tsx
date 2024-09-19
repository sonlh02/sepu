import { Dispatch, SetStateAction } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface NewPowerlineModalProps {
  className?: string
  setIsNewModalShow: Dispatch<SetStateAction<boolean>>
  fetchData: (params: any, limit: number, page: number) => void
  params: any
  limit: number
  currentPage: number
}

export default function NewPowerlineModal({
  className,
  setIsNewModalShow,
  fetchData,
  params,
  limit,
  currentPage
}: NewPowerlineModalProps) {
  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name")?.toString() || ""
    const code = formData.get("code")?.toString() || ""
    const note = formData.get("note")?.toString() || ""

    fetchWithToken(SE.API_ROUTE, {
      method: "POST",
      body: JSON.stringify({
        name: name,
        code: code,
        note: note,
      }),
    })
      .then((data) => {
        if (data.message) toast.success(data.message)
        setIsNewModalShow(false)
        fetchData(params, limit, currentPage)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  return (
    <Dialog open={true} onOpenChange={() => setIsNewModalShow(false)}>
      <DialogContent className={`sm:max-w-[600px] ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Thêm tuyến</DialogTitle>
        </DialogHeader>
        <form onSubmit={create} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right">
              Tên tuyến <span className="text-destructive">*</span>
            </Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code" className="text-right">
              Mã tuyến <span className="text-destructive">*</span>
            </Label>
            <Input id="code" name="code" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note" className="text-right">
              Ghi chú
            </Label>
            <Textarea id="note" name="note" />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit" className="flex-1">Thêm</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}