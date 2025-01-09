'use client'

import { useState } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { InspectType } from "@/enum/inspect_type"
import { InspectData, ImageData, IncidentData, PagingDoc } from "../doc_data"
import { VStep1 } from "./_step_inspect/Step1"
import { VStep2 } from "./_step_inspect/Step2"
import { VStep3 } from "./_step_inspect/Step3"
import { ViewImage, ViewIncidentImage } from "./_modal2/ViewImage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useFormState } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"

interface ApprovalInspectModalProps {
  className?: string
  inspectData: InspectData
  setAction: (action: string) => void
  fetchData: Function
  currentPage: PagingDoc
}

async function approveAction(prevState: any, formData: FormData) {
  try {
    const response = await fetchWithToken(SE.API_WORKINSPECTAPPROVE, {
      method: "POST",
      body: JSON.stringify({
        doc_id: formData.get('doc_id')
      }),
    })
    if (response.message) toast.success(response.message)
    return { success: true, message: response.message }
  } catch (e: any) {
    if (e.message) toast.error(e.message)
    return { success: false, message: e.message }
  }
}

export default function ApprovalInspectModal({
  className,
  inspectData,
  setAction,
  fetchData,
  currentPage,
}: ApprovalInspectModalProps) {
  const [act, setAct] = useState<string>("")
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [incident, setIncident] = useState<IncidentData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [state, formAction] = useFormState(approveAction, null)
  const [isOpen, setIsOpen] = useState(false)

  const handleApprove = async (formData: FormData) => {
    const result = await approveAction(null, formData)
    if (result.success) {
      setAction("")
      fetchData(currentPage)
      setIsOpen(false)
    }
  }

  const steps = [
    { title: "Thông tin", component: VStep1 },
    { title: "Bất thường", component: VStep2 },
    { title: "Báo cáo", component: VStep3 },
  ]

  return (
    <>
      <Dialog open={true} onOpenChange={() => setAction("")}>
        <DialogTrigger asChild>
          <Button variant="outline">Mở phiếu kiểm tra</Button>
        </DialogTrigger>
        <DialogContent className={`max-w-4xl p-0 overflow-hidden ${className || ""}`}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-center text-2xl font-bold">
              <Badge variant="outline" className={`absolute top-2 left-2 ${inspectData.type === InspectType.Day ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                {inspectData.type === InspectType.Day ? "Phiếu kiểm tra ngày" : "Phiếu kiểm tra đêm"}
              </Badge>
              Phiếu <span className="break-all font-mono">{inspectData.code}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center py-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep ? "bg-primary text-primary-foreground" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 ${index < currentStep ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          <form action={handleApprove} className="space-y-6 p-6">
            <input type="hidden" name="doc_id" value={inspectData.id} />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {steps.map((step, index) => (
                  <div key={index} className={currentStep === index ? "" : "hidden"}>
                    <step.component
                      className="h-[calc(100dvh-20rem)] overflow-y-auto pr-4 custom-scrollbar"
                      inspectData={inspectData}
                      setImageData={setImageData}
                      setIncident={setIncident}
                      setAct={setAct}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={currentStep <= 0}
                onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
              <Button
                type="button"
                variant="default"
                className="flex-1 mx-2"
                disabled={currentStep >= 2}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Bước tiếp theo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1 bg-blue-800 hover:bg-blue-900 text-white"
              >
                <Check className="mr-2 h-4 w-4" /> Ký duyệt
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

      {act === "img-incident" && incident && (
        <ViewIncidentImage
          incident={incident}
          setIncident={setIncident}
          setAct={setAct}
        />
      )}
    </>
  )
}