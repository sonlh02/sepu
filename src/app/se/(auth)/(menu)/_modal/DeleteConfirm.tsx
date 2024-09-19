import { Dispatch, SetStateAction } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function DeleteConfirm({
  className,
  title,
  setIsDeleteConfirmModalShow,
  deleteFunction,
}: {
  className?: string
  title: string
  setIsDeleteConfirmModalShow: Dispatch<SetStateAction<any | null>>;
  deleteFunction: Function;
}) {
  return (
    <Dialog open={true}>
      <DialogContent className={`sm:max-w-[425px] ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsDeleteConfirmModalShow(null)}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => {
              deleteFunction()
              setIsDeleteConfirmModalShow(null);
            }}
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}