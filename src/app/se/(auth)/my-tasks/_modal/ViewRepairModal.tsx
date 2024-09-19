import { Dispatch, SetStateAction, useState } from "react"
import { RepairData, ImageData } from "../doc_data"
import { VStep1 } from "./_step_repair/Step1"
import { VStep2 } from "./_step_repair/Step2"
import { ViewImage } from "./_modal2/ViewImage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X } from "lucide-react"

export default function ViewRepairModal({
  className,
  repairData,
  setAction,
}: {
  className?: string
  repairData: RepairData
  setAction: Dispatch<SetStateAction<string>>
}) {
  const [act, setAct] = useState<string>("")
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [currentStep, setCurrentStep] = useState("info")

  return (
    <>
      <Dialog open={true} onOpenChange={() => setAction("")}>
        <DialogContent className={`sm:max-w-[700px] ${className || ""}`}>
          <DialogHeader>
            <DialogTitle className="text-center">
              <Badge variant="outline" className="mb-2">
                Phiếu sửa chữa
              </Badge>
              <div className="text-2xl font-bold">
                Phiếu <span className="break-all font-mono">{repairData.code}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="report">Báo cáo</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4">
              <div className="h-[calc(100dvh-20rem)] overflow-y-auto">
                <VStep1 repairData={repairData} />
              </div>
            </TabsContent>
            <TabsContent value="report" className="mt-4">
              <div className="h-[calc(100dvh-20rem)] overflow-y-auto">
                <VStep2
                  repairData={repairData}
                  setImageData={setImageData}
                  setAct={setAct}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("info")}
              disabled={currentStep === "info"}
            >
              Quay lại
            </Button>
            <Button
              onClick={() => setCurrentStep("report")}
              disabled={currentStep === "report"}
            >
              Bước tiếp theo
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setAction("")}
          >
            <X className="h-4 w-4" />
          </Button>
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