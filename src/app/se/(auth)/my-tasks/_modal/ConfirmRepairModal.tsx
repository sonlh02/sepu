'use client'

import { Dispatch, SetStateAction } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { RepairData, PagingDoc } from "../doc_data"
import { VStep1 } from "./_step_repair/Step1"
import { X, CheckCircle, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function ConfirmRepairModal({
  repairData,
  className,
  setAction,
  fetchData,
  currentPage,
}: {
  repairData: RepairData
  className?: string
  setAction: Dispatch<SetStateAction<string>>
  fetchData: Function
  currentPage: PagingDoc
}) {
  async function confirm() {
    try {
      const data = await fetchWithToken(SE.API_WORKREPAIRCONFIRM, {
        method: "POST",
        body: JSON.stringify({
          repair_doc_id: repairData.id,
        }),
      })
      if (data.message) toast.success(data.message)
      setAction("")
      fetchData(currentPage)
    } catch (e: any) {
      if (e.message) toast.error(e.message)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => setAction("")}>
      <DialogContent className="sm:max-w-[700px] ">
        <DialogHeader>
          <DialogTitle className={`text-center flex items-center justify-center space-x-2 ${className || ""}`}>
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <span>Phiếu sửa chữa</span>
          </DialogTitle>
          <Badge variant="outline" className="mx-auto mt-2">
            {repairData.code}
          </Badge>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto px-1">
          <VStep1
            // className="grid gap-4 sm:grid-cols-2"
            repairData={repairData}
          />
        </ScrollArea>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => setAction("")}>
            Hủy
          </Button>
          <Button onClick={confirm} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            Nhận phiếu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}