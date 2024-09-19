'use client'

import { useState, Dispatch, SetStateAction } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { ReferenceData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, X } from "lucide-react"

export default function NewPowerModal({
  powerline,
  setIsNewModalShow,
  fetchData,
  params,
  limit,
  currentPage,
  crossCut,
  referenceData,
}: {
  powerline: string
  setIsNewModalShow: Dispatch<SetStateAction<boolean | number>>
  fetchData: Function
  params: any
  limit: number
  currentPage: number
  crossCut: boolean
  referenceData: ReferenceData
}) {
  const [isOpen, setIsOpen] = useState(false)

  async function create(formData: FormData) {
    const name = formData.get("name")?.toString() || ""
    const code = formData.get("code")?.toString() || ""
    const latitude = Number(formData.get("latitude")?.toString() || "0")
    const longitude = Number(formData.get("longitude")?.toString() || "0")
    const origin = formData.get("origin")?.toString() || null
    const note = formData.get("note")?.toString() || ""

    try {
      const response = await fetchWithToken(
        `${SE.API_ROUTE}/${powerline}/power`,
        {
          method: "POST",
          body: JSON.stringify({
            name: name,
            code: code,
            latitude: latitude,
            longitude: longitude,
            origin: origin,
            note: note,
            items: Object.assign(
              {},
              ...Object.entries(referenceData.items).map(
                ([itemId, _itemName]) => ({
                  [itemId]: {
                    status: Number(
                      formData.get(`${itemId}Status`)?.toString() || "1"
                    ),
                    note: formData.get(`${itemId}Note`)?.toString() || "",
                  },
                })
              )
            ),
          }),
        }
      )

      if (response.message) toast.success(response.message)

      setIsOpen(false)
      setIsNewModalShow(false)
      if (crossCut) {
        fetchData(params, limit, currentPage)
      } else {
        fetchData(powerline, params, limit, currentPage)
      }
    } catch (e: any) {
      if (e.message) toast.error(e.message)
    }
  }

  return (
    <>
      <Dialog open={true} onOpenChange={() => setIsNewModalShow(false)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Thêm cột mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            create(new FormData(e.currentTarget))
          }} className="flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow pr-4">
              <div className="grid gap-6 py-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Tên cột <span className="text-red-500">*</span>
                        </Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm font-medium">
                          Mã cột <span className="text-red-500">*</span>
                        </Label>
                        <Input id="code" name="code" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="latitude" className="text-sm font-medium">
                          Vĩ độ
                        </Label>
                        <Input id="latitude" name="latitude" type="number" step="any" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude" className="text-sm font-medium">
                          Kinh độ
                        </Label>
                        <Input id="longitude" name="longitude" type="number" step="any" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="origin" className="text-sm font-medium">
                          Cột nối tiếp
                        </Label>
                        <Input id="origin" name="origin" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="note" className="text-sm font-medium">
                          Ghi chú
                        </Label>
                        <Textarea id="note" name="note" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Label className="text-lg font-semibold mb-4 block">Thiết bị</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Tên</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ghi chú</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(referenceData.items).map(([itemId, itemName]) => (
                          <TableRow key={itemId}>
                            <TableCell className="font-medium">{itemName}</TableCell>
                            <TableCell>
                              <Select name={`${itemId}Status`} defaultValue="1">
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Bình thường</SelectItem>
                                  <SelectItem value="2">Cảnh báo</SelectItem>
                                  <SelectItem value="3">Báo động</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input name={`${itemId}Note`} placeholder="Ghi chú" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                Thêm cột
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}