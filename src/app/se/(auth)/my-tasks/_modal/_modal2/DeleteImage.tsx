import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { InspectData, RepairData, ImageData, PagingDoc } from "../../doc_data"

type Props = {
  data: InspectData | RepairData
  imageData: ImageData
  setImageData: React.Dispatch<React.SetStateAction<ImageData | null>>
  setAct: React.Dispatch<React.SetStateAction<string>>
  fetchData: Function
  currentPage: PagingDoc
  type: "inspect" | "repair"
}

export function ImageDeletionDialog({
  data,
  imageData,
  setImageData,
  setAct,
  fetchData,
  currentPage,
  type,
}: Props) {
  const [isOpen, setIsOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm()

  const closeDialog = () => {
    setIsOpen(false)
    setAct("")
    setImageData(null)
  }

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      const endpoint = type === "inspect" ? SE.API_WORKINSPECTIMAGE : SE.API_WORKREPAIRIMAGE
      const body = type === "inspect"
        ? { doc_id: data.id, image_id: imageData.id }
        : { repair_doc_id: data.id, image_id: imageData.id }

      const response = await fetchWithToken(endpoint, {
        method: "DELETE",
        body: JSON.stringify(body),
      })

      if (response.message) {
        toast.success(response.message)
      }

      closeDialog()
      fetchData(currentPage)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xoá ảnh</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xoá ảnh này không?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <p className="text-center font-mono">{imageData.name}</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Hủy
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xoá...
                  </>
                ) : (
                  "Xoá ảnh"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}