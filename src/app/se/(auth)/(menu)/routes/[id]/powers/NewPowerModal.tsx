"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { ReferenceData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

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
  setIsNewModalShow: React.Dispatch<React.SetStateAction<boolean | number>>
  fetchData: Function
  params: any
  limit: number
  currentPage: number
  crossCut: boolean
  referenceData: ReferenceData
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    latitude: "",
    longitude: "",
    origin: "",
    note: "",
  })

  const [itemStatus, setItemStatus] = useState<Record<string, { status: string; note: string }>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleItemStatusChange = (itemId: string, field: 'status' | 'note', value: string) => {
    setItemStatus({
      ...itemStatus,
      [itemId]: { ...itemStatus[itemId], [field]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetchWithToken(
        `${SE.API_ROUTE}/${powerline}/power`,
        {
          method: "POST",
          body: JSON.stringify({
            ...formData,
            latitude: Number(formData.latitude) || 0,
            longitude: Number(formData.longitude) || 0,
            items: Object.entries(itemStatus).reduce((acc, [itemId, data]) => {
              acc[itemId] = { status: Number(data.status), note: data.note }
              return acc
            }, {} as Record<string, { status: number; note: string }>)
          }),
        }
      )
      if (response.message) toast.success(response.message)
      setIsNewModalShow(false)
      if (crossCut) {
        fetchData(params, limit, currentPage)
      } else {
        fetchData(powerline, params, limit, currentPage)
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => setIsNewModalShow(false)}>
      <DialogContent className="sm:max-w-[1200px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Thêm cột</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base">
                    Tên cột <span className="text-destructive">*</span>
                  </Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="code" className="text-base">
                    Mã cột <span className="text-destructive">*</span>
                  </Label>
                  <Input id="code" name="code" value={formData.code} onChange={handleInputChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="latitude" className="text-base">Vĩ độ</Label>
                  <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-base">Kinh độ</Label>
                  <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="origin" className="text-base">Cột nối tiếp</Label>
                  <Input id="origin" name="origin" value={formData.origin} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="note" className="text-base">Ghi chú</Label>
                  <Textarea id="note" name="note" value={formData.note} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-base mb-2 block">Thiết bị</Label>
                <ScrollArea className="h-[calc(100vh-300px)] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[180px]">Tên thiết bị</TableHead>
                        <TableHead className="w-[120px]">Trạng thái</TableHead>
                        <TableHead>Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(referenceData.items).map(([itemId, itemName]) => (
                        <TableRow key={itemId}>
                          <TableCell className="font-medium">{itemName}</TableCell>
                          <TableCell>
                            <Select 
                              onValueChange={(value) => handleItemStatusChange(itemId, 'status', value)}
                              value={itemStatus[itemId]?.status || "1"}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Bình thường" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Bình thường</SelectItem>
                                <SelectItem value="2">Cảnh báo</SelectItem>
                                <SelectItem value="3">Báo động</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Ghi chú"
                              value={itemStatus[itemId]?.note || ''}
                              onChange={(e) => handleItemStatusChange(itemId, 'note', e.target.value)}
                              className="w-52"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          </div>
          <div className="p-6 bg-background">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Thêm</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}