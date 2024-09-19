"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { InspectType } from "@/enum/inspect_type"
import { InspectData, IncidentData, ImageData } from "../doc_data"
import { VStep1 } from "./_step_inspect/Step1"
import { VStep2 } from "./_step_inspect/Step2"
import { VStep3 } from "./_step_inspect/Step3"
import { ViewImage, ViewIncidentImage } from "./_modal2/ViewImage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function ViewInspectModal({
  inspectData,
  setAction,
}: {
  inspectData: InspectData
  setAction: Dispatch<SetStateAction<string>>
}) {
  const [act, setAct] = useState<string>("")
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [incident, setIncident] = useState<IncidentData | null>(null)
  const [currentStep, setCurrentStep] = useState("1")

  const handleStepChange = (value: string) => {
    setCurrentStep(value)
  }

  return (
    <>
      <Dialog open={true} onOpenChange={() => setAction("")}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Badge variant={inspectData.type === InspectType.Day ? "outline" : "secondary"} className="mb-2">
                {inspectData.type === InspectType.Day ? "Phiếu kiểm tra ngày" : "Phiếu kiểm tra đêm"}
              </Badge>
              <div>
                Phiếu <span className="break-all font-mono">{inspectData.code}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <Tabs value={currentStep} onValueChange={handleStepChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1">Thông tin</TabsTrigger>
              <TabsTrigger value="2">Bất thường</TabsTrigger>
              <TabsTrigger value="3">Báo cáo</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(100vh-20rem)] w-full">
              <TabsContent value="1">
                <VStep1 inspectData={inspectData} />
              </TabsContent>
              <TabsContent value="2">
                <VStep2
                  inspectData={inspectData}
                  setImageData={setImageData}
                  setIncident={setIncident}
                  setAct={setAct}
                />
              </TabsContent>
              <TabsContent value="3">
                <VStep3 inspectData={inspectData} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => handleStepChange(String(Math.max(parseInt(currentStep) - 1, 1)))}
              disabled={currentStep === "1"}
            >
              Quay lại
            </Button>
            <Button
              onClick={() => handleStepChange(String(Math.min(parseInt(currentStep) + 1, 3)))}
              disabled={currentStep === "3"}
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