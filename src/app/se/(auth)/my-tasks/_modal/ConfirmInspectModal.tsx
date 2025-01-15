"use client"

import { Dispatch, SetStateAction } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { InspectType } from "@/enum/inspect_type"
import { InspectData, PagingDoc } from "../doc_data"
import { VStep1 } from "./_step_inspect/Step1"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { X, CheckCircle, AlertCircle } from "lucide-react"

export default function ConfirmInspectModal({
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
  const confirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await fetchWithToken(SE.API_WORKINSPECTCONFIRM, {
        method: "POST",
        body: JSON.stringify({
          doc_id: inspectData.id,
        }),
      })
      if (response.message) toast.success(response.message)
      setAction("")
      fetchData(currentPage)
    } catch (e) {
      if (e instanceof Error && e.message) toast.error(e.message)
    }
  }

  const handleClose = () => setAction("")

  return (
    <div className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm ${className}`}>
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
        <div className="flex flex-col space-y-1.5 text-center">
          <Badge 
            variant={inspectData.type === InspectType.Day ? "default" : "secondary"}
            className="px-3 py-1 text-sm font-semibold self-center"
          >
            {inspectData.type === InspectType.Day ? (
              <><CheckCircle className="w-4 h-4 mr-1" /> Phiếu kiểm tra ngày</>
            ) : (
              <><AlertCircle className="w-4 h-4 mr-1" /> Phiếu kiểm tra đêm</>
            )}
          </Badge>
          <h2 className="text-2xl font-semibold leading-none tracking-tight">
            Phiếu <span className="font-mono text-primary">{inspectData.code}</span>
          </h2>
        </div>
        <form onSubmit={confirm} className="mt-4">
          <Card className="border-none">
            <CardContent className="p-6">
              <ScrollArea className="h-[calc(100dvh-20rem)] pr-4">
                <VStep1
                  className="sm:grid-cols-2 gap-4"
                  inspectData={inspectData}
                />
              </ScrollArea>
            </CardContent>
          </Card>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="mt-3 sm:mt-0"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="default"
              className="bg-blue-500 text-primary-foreground hover:bg-primary/90"
            >
              Nhận phiếu
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}