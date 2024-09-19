'use client'

import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { PowerlineData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface EditPowerlineModalProps {
  className?: string;
  data: PowerlineData
  setEditingData: Dispatch<SetStateAction<PowerlineData | null>>
  fetchData: Function
  params: any
  limit: number
  currentPage: number
}

interface FormData {
  name: string
  code: string
  note: string | undefined
}

export default function EditPowerlineModal({
  className,
  data,
  setEditingData,
  fetchData,
  params,
  limit,
  currentPage
}: EditPowerlineModalProps) {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: data.name,
      code: data.code,
      note: data.note
    }
  })

  const onSubmit = async (formData: FormData) => {
    try {
      const response = await fetchWithToken(
        `${SE.API_ROUTE}/${data.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: formData.name,
            code: formData.code,
            note: formData.note || "" // Use an empty string if note is undefined
          }),
        }
      )
      if (response.message) toast.success(response.message)
      setEditingData(null)
      fetchData(params, limit, currentPage)
    } catch (e) {
      if (e instanceof Error && e.message) toast.error(e.message)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => setEditingData(null)}>
      <DialogContent className={`sm:max-w-[600px] ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Sửa tuyến</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              <span className="text-destructive mr-1">*</span>
              Tên tuyến
            </Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">
              <span className="text-destructive mr-1">*</span>
              Mã tuyến
            </Label>
            <Input id="code" {...register("code", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea id="note" {...register("note")} />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit" className="flex-1">Cập nhật</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}