'use client'

import { Dispatch, SetStateAction } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { InspectData, IncidentData, PagingDoc } from "../../doc_data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function DeleteIncident({
  inspectData,
  incident,
  setIncident,
  setAct,
  fetchData,
  currentPage,
}: {
  inspectData: InspectData
  incident: IncidentData
  setIncident: Dispatch<SetStateAction<IncidentData | null>>
  setAct: Dispatch<SetStateAction<string>>
  fetchData: Function
  currentPage: PagingDoc
}) {
  const deleteIncident = async () => {
    try {
      const response = await fetchWithToken(SE.API_WORKINSPECTINCIDENT, {
        method: "DELETE",
        body: JSON.stringify({
          doc_id: inspectData.id,
          incident_fly_id: incident.id,
        }),
      })
      
      if (response.message) toast.success(response.message)
      
      setAct("")
      fetchData(currentPage)
    } catch (e: any) {
      if (e.message) toast.error(e.message)
    }
  }

  const handleClose = () => {
    setAct("")
    setIncident(null)
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            Xoá bất thường: {incident.index}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Hủy
          </Button>
          <Button variant="destructive" onClick={deleteIncident} className="flex-1">
            Xoá bất thường
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}