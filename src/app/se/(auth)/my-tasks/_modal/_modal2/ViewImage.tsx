import { Dispatch, SetStateAction } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IncidentData, ImageData } from "../../doc_data"

export function ViewImage({
  imageData,
  setImageData,
  setAct,
  del,
}: {
  imageData: ImageData
  setImageData: Dispatch<SetStateAction<ImageData | null>>
  setAct: Dispatch<SetStateAction<string>>
  del?: boolean
}) {
  const handleClose = () => {
    setAct("")
    setImageData(null)
  }

  return (
    <Dialog open={!!imageData} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>{imageData.name}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="relative">
          <Image
            className="w-full h-auto border"
            src={`${process.env.NEXT_PUBLIC_API_URL}/${imageData.path}`}
            alt={imageData.name}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
          />
          {del && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute left-4 bottom-4"
              onClick={() => {
                setAct("img-delete")
                setImageData(imageData)
              }}
            >
              Xoá ảnh
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ViewIncidentImage({
  incident,
  setIncident,
  setAct,
}: {
  incident: IncidentData
  setIncident: Dispatch<SetStateAction<IncidentData | null>>
  setAct: Dispatch<SetStateAction<string>>
}) {
  const handleClose = () => {
    setAct("")
    setIncident(null)
  }

  return (
    <Dialog open={!!incident} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <Image
          className="w-full h-auto border"
          src={`${process.env.NEXT_PUBLIC_API_URL}/${incident.path}`}
          alt="incident"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
        />
      </DialogContent>
    </Dialog>
  )
}