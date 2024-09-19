'use client'

import { Dispatch, SetStateAction, useState, useEffect } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { InspectType } from "@/enum/inspect_type"
import { InspectData, WarningData, PagingDoc } from "../doc_data"
import { VStep1 } from "./_step_inspect/Step1"
import { NStep2 } from "./_step_inspect/Step2"
import { NStep3 } from "./_step_inspect/Step3"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ChevronRight, ChevronLeft, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SubmitInspectModal({
  className,
  inspectData,
  setAction,
  fetchData,
  currentPage,
}: {
  className?: string
  inspectData: InspectData
  setAction: Dispatch<SetStateAction<string>>
  fetchData: Function
  currentPage: PagingDoc
}) {
  const [images, setImages] = useState<Array<File>>([])
  const [warnings, setWarnings] = useState<Array<WarningData>>([
    {
      id: Math.random(),
      powerPole: undefined,
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      image: undefined,
      object: undefined,
      description: undefined,
    },
  ])
  
  const [currentStep, setCurrentStep] = useState(0)
  const [disableSubmit, setDisableSubmit] = useState(true)

  function submit(formData: FormData) {
    const submitFormData = new FormData()

    submitFormData.append("doc_id", String(inspectData.id))
    images.forEach((img) => {
      submitFormData.append("images", img)
    })

    if (warnings.length > 1 || (warnings.length == 1 && warnings[0].powerPole && warnings[0].image)) {
      submitFormData.append(
        "incident",
        JSON.stringify(
          warnings.map((warning) => ({
            power_id: warning.powerPole,
            latitude: warning.latitude,
            longitude: warning.longitude,
            altitude: warning.altitude,
            image: warning.image,
            incident_type: warning.object,
            incident: warning.description,
          }))
        )
      )
    }

    submitFormData.append(
      "result",
      JSON.stringify(
        inspectData.type === InspectType.Night
          ? {
              heat_coupling: formData.get("1_1")?.toString() || "",
              discharge: formData.get("1_2")?.toString() || "",
              other: formData.get("2")?.toString() || "",
              suggest: formData.get("3")?.toString() || "",
            }
          : {
              corridor: formData.get("1_1")?.toString() || "",
              steel_col: formData.get("1_2")?.toString() || "",
              col_foundation: formData.get("1_3")?.toString() || "",
              structure: formData.get("1_4")?.toString() || "",
              insulate: formData.get("1_5")?.toString() || "",
              electric_wire: formData.get("1_6")?.toString() || "",
              earthing: formData.get("1_7")?.toString() || "",
              holding_rope: formData.get("1_8")?.toString() || "",
              anti_lightning: formData.get("1_9")?.toString() || "",
              anti_vibration: formData.get("1_10")?.toString() || "",
              heat_coupling: formData.get("1_11")?.toString() || "",
              processed: formData.get("2")?.toString() || "",
              suggest: formData.get("3")?.toString() || "",
            }
      )
    )

    fetchWithToken(SE.API_WORKINSPECTSUBMIT, {
      method: "POST",
      headers: { "Content-Type": null },
      body: submitFormData,
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

  useEffect(() => {
    if (currentStep < 2) return setDisableSubmit(true)
    new Promise((resolve) => setTimeout(resolve, 10)).then((_) =>
      setDisableSubmit(false)
    )
  }, [currentStep])

  const steps = ["Thông tin", "Bất thường", "Báo cáo"]

  return (
    <Dialog open={true} onOpenChange={() => setAction("")}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            <Badge 
              variant="outline" 
              className={cn(
                "mb-2 text-lg font-semibold",
                inspectData.type === InspectType.Day 
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                  : "bg-indigo-100 text-indigo-800 border-indigo-300"
              )}
            >
              {inspectData.type === InspectType.Day ? "Phiếu kiểm tra ngày" : "Phiếu kiểm tra đêm"}
            </Badge>
            <div className="text-3xl font-bold mt-2">
              Phiếu <span className="break-all font-mono text-primary">{inspectData.code}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold",
                    index <= currentStep 
                      ? "border-primary bg-primary text-primary-foreground" 
                      : "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <span className={cn(
                  "ml-2 font-medium",
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                )}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="ml-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <VStep1
            className={cn(
              "rounded-lg border p-4 shadow-sm transition-all duration-300 ease-in-out",
              currentStep === 0 ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden"
            )}
            inspectData={inspectData}
          />

          <NStep2
            className={cn(
              "rounded-lg border p-4 shadow-sm transition-all duration-300 ease-in-out",
              currentStep === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden"
            )}
            inspectData={inspectData}
            images={images}
            setImages={setImages}
            warnings={warnings}
            setWarnings={setWarnings}
          />

          <NStep3
            id="finalStep"
            className={cn(
              "rounded-lg border p-4 shadow-sm transition-all duration-300 ease-in-out",
              currentStep === 2 ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden"
            )}
            inspectData={inspectData}
            action={submit}
          />
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            disabled={currentStep <= 0}
            onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          {currentStep < 2 ? (
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center"
            >
              Bước tiếp theo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              form="finalStep"
              variant="default"
              disabled={disableSubmit}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              Nộp phiếu <Send className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          onClick={() => setAction("")}
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  )
}