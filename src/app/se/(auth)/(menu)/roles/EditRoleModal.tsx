import { Dispatch, SetStateAction, useState } from "react"
import { toast } from "react-toastify"
import { X, Save, Trash2 } from "lucide-react"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ReferenceData, RoleData } from "./page"

export default function EditRoleModal({
  data,
  setEditingData,
  fetchData,
  params,
  limit,
  currentPage,
  referenceData,
}: {
  data: RoleData
  setEditingData: Dispatch<SetStateAction<RoleData | null>>
  fetchData: (params: any, limit: number, currentPage: number) => void
  params: any
  limit: number
  currentPage: number
  referenceData: ReferenceData
}) {
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.keys(referenceData).map((key) => [
        key,
        data.items.find((item) => Object.keys(referenceData[key]).includes(item)) || "",
      ])
    )
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name")?.toString() || ""
    const description = formData.get("description")?.toString() || ""

    try {
      const response = await fetchWithToken(`${SE.API_ROLE}/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name,
          description: description,
          item: Object.values(selectedItems).filter(Boolean).join(","),
        }),
      })

      if (response.message) toast.success(response.message)
      setEditingData(null)
      fetchData(params, limit, currentPage)
    } catch (e: unknown) {
      if (e instanceof Error && e.message) toast.error(e.message)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => setEditingData(null)}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-primary text-primary-foreground">
          <DialogTitle className="text-2xl font-bold">Sửa vai trò</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Vai trò <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={data.name}
                required
                className="border-gray-300 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={data.description}
                className="border-gray-300 focus:border-primary resize-none h-24"
              />
            </div>
          </div>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-6">
              {Object.entries(referenceData).map(([roleItemId, roleItemData]) => (
                <div key={roleItemId} className="space-y-2 rounded-lg border p-4 bg-secondary">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold capitalize">
                      {roleItemId}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedItems(prev => ({ ...prev, [roleItemId]: "" }))}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Clear selection</span>
                    </Button>
                  </div>
                  <RadioGroup
                    value={selectedItems[roleItemId]}
                    onValueChange={(value) => setSelectedItems(prev => ({ ...prev, [roleItemId]: value }))}
                    className="grid grid-cols-2 gap-2"
                  >
                    {Object.entries(roleItemData).map(([optionId, optionName]) => (
                      <div key={optionId} className="flex items-center space-x-2 bg-background rounded-md p-2">
                        <RadioGroupItem value={optionId} id={optionId} />
                        <Label htmlFor={optionId} className="text-sm">{optionName}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setEditingData(null)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> Cập nhật
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}