import { Dispatch, SetStateAction, useState } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { RepairData, ImageData, PagingDoc } from "../doc_data"
import { VStep1 } from "./_step_repair/Step1"
import { VStep2 } from "./_step_repair/Step2"
import { ViewImage } from "./_modal2/ViewImage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export default function ApprovalRepairModal({
  repairData,
  setAction,
  fetchData,
  currentPage,
}: {
  repairData: RepairData
  setAction: Dispatch<SetStateAction<string>>
  fetchData: Function
  currentPage: PagingDoc
}) {
  const [act, setAct] = useState<string>("")
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  function approve(formData: FormData) {
    fetchWithToken(SE.API_WORKREPAIRAPPROVE, {
      method: "POST",
      body: JSON.stringify({
        repair_doc_id: repairData.id,
      }),
    })
      .then((data) => {
        if (data.message) toast.success(data.message)
        setAction("")
        fetchData(currentPage)
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message)
      })
  }

  return (
    <>
      <Dialog open={true} onOpenChange={() => setAction("")}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="text-sm font-normal text-muted-foreground">Phiếu sửa chữa</span>
              <br />
              <span className="font-mono text-xl font-bold">{repairData.code}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="mb-6 flex justify-center">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${currentStep === 0 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-0.5 w-16 ${currentStep === 1 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === 1 ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            </div>
            <div className="mb-2 flex justify-center text-sm font-medium">
              <span className={`mr-20 ${currentStep === 0 ? 'text-primary' : 'text-muted-foreground'}`}>Thông tin</span>
              <span className={currentStep === 1 ? 'text-primary' : 'text-muted-foreground'}>Báo cáo</span>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); approve(new FormData(e.currentTarget)) }}>
            <div className="h-[calc(100vh-300px)] overflow-y-auto px-1">
              <VStep1
                // className={`${currentStep === 0 ? 'block' : 'hidden'}`}
                repairData={repairData}
              />
              <VStep2
                className={`${currentStep === 1 ? 'block' : 'hidden'}`}
                repairData={repairData}
                setImageData={setImageData}
                setAct={setAct}
              />
            </div>
            <div className="mt-6 flex justify-between space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(Math.min(currentStep + 1, 1))}
                disabled={currentStep === 1}
              >
                Bước tiếp theo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button type="submit" variant="default">
                Ký duyệt
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {act === "img-view" && imageData && (
        <ViewImage
          imageData={imageData}
          setImageData={setImageData}
          setAct={setAct}
        />
      )}
    </>
  )
}