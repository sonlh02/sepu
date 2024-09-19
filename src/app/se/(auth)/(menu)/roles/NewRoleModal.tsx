import { Dispatch, SetStateAction, useState } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ReferenceData } from "./page"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function NewRoleModal({
  setIsNewModalShow,
  fetchData,
  params,
  limit,
  currentPage,
  referenceData,
}: {
  setIsNewModalShow: Dispatch<SetStateAction<boolean>>
  fetchData: Function
  params: any
  limit: number
  currentPage: number
  referenceData: ReferenceData
}) {
  const [selectedItem, setSelectedItem] = useState<Array<string>>([])

  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name")?.toString() || ""
    const description = formData.get("description")?.toString() || ""

    fetchWithToken(SE.API_ROLE, {
      method: "POST",
      body: JSON.stringify({
        name: name,
        description: description,
        item: selectedItem.filter((item) => item !== "").join(","),
      }),
    })
      .then((data) => {
        if (data.message) toast.success(data.message)
        setIsNewModalShow(false)
        fetchData(params, limit, currentPage)
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message)
      })
  }

  return (
    <Dialog open={true} onOpenChange={() => setIsNewModalShow(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Thêm vai trò mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={create} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Tên vai trò <span className="text-destructive">*</span>
              </Label>
              <Input id="name" name="name" placeholder="Nhập tên vai trò" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả
              </Label>
              <Input id="description" name="description" placeholder="Nhập mô tả vai trò" />
            </div>
          </div>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <Accordion type="multiple" className="w-full">
              {Object.entries(referenceData).map(([roleItemId, roleItemData]) => (
                <AccordionItem value={roleItemId} key={roleItemId}>
                  <AccordionTrigger className="text-sm font-medium">
                    {roleItemId}
                  </AccordionTrigger>
                  <AccordionContent>
                    <RadioGroup
                      onValueChange={(value) => {
                        setSelectedItem((prev) => [
                          ...prev.filter((item) => !Object.keys(roleItemData).includes(item)),
                          value,
                        ])
                      }}
                      className="space-y-2"
                    >
                      {Object.entries(roleItemData).map(([optionId, optionName]) => (
                        <div key={optionId} className="flex items-center space-x-2">
                          <RadioGroupItem value={optionId} id={optionId} />
                          <Label htmlFor={optionId} className="text-sm">{optionName}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
          <DialogFooter>
            <Button type="submit" className="w-full">Thêm vai trò</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}