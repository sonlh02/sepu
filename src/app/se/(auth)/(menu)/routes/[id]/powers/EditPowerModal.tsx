'use client'

import { Dispatch, SetStateAction, useState, useEffect } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { PowerPoleData, ReferenceData } from "./page"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Status } from "@/enum/status"

interface FormDataItem {
  name: string
  status: Status
  note: string
}

interface FormData {
  name: string
  code: string
  latitude: number
  longitude: number
  origin: string
  note: string
  items: { [key: string]: FormDataItem }
}

export default function EditPowerModal({
  powerline,
  data,
  setEditingData,
  fetchData,
  params,
  limit,
  currentPage,
  referenceData,
}: {
  powerline: string
  data: PowerPoleData
  setEditingData: Dispatch<SetStateAction<PowerPoleData | null>>
  fetchData: Function
  params: any
  limit: number
  currentPage: number
  referenceData: ReferenceData
}) {
  const [activeTab, setActiveTab] = useState("general")
  const [equipmentSearch, setEquipmentSearch] = useState("")
  const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1)
  const itemsPerPage = 4

  const [formData, setFormData] = useState<FormData>(() => {
    const items = Object.entries(referenceData.items).reduce((acc, [itemId, itemName]) => {
      acc[itemId] = {
        name: itemName,
        status: data.items[itemId]?.status || Status.Okay,
        note: data.items[itemId]?.note || '',
      }
      return acc
    }, {} as { [key: string]: FormDataItem })

    return {
      name: data.name,
      code: data.code,
      latitude: Object.values(data.coordinates)[0] as number,
      longitude: Object.values(data.coordinates)[1] as number,
      origin: data.origin || '',
      note: data.note || '',
      items: items
    }
  })

  const filteredEquipment = Object.entries(referenceData.items).filter(([_, itemName]) =>
    itemName.toLowerCase().includes(equipmentSearch.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage)
  const paginatedEquipment = filteredEquipment.slice(
    (currentEquipmentPage - 1) * itemsPerPage,
    currentEquipmentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentEquipmentPage(1)
  }, [equipmentSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: Status, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: {
          ...prev.items[itemId],
          status: value
        }
      }
    }))
  }

  const handleItemNoteChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: {
          ...prev.items[itemId],
          note: value
        }
      }
    }))
  }

  function edit(e: React.FormEvent) {
    e.preventDefault()
    const updatedData = {
      ...formData,
      items: Object.fromEntries(
        Object.entries(formData.items).map(([itemId, item]) => [
          itemId,
          {
            status: item.status,
            note: item.note
          }
        ])
      )
    }
    fetchWithToken(
      `${SE.API_ROUTE}/${powerline}/power/${data.id}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedData),
      }
    )
      .then((data) => {
        if (data.message) toast.success(data.message)
        setEditingData(null)
        fetchData(powerline, params, limit, currentPage)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  const statusColors = {
    [Status.Okay]: "text-green-600",
    [Status.Warning]: "text-yellow-600",
    [Status.Error]: "text-red-600",
  }

  const statusText = {
    [Status.Okay]: "Bình thường",
    [Status.Warning]: "Cảnh báo",
    [Status.Error]: "Báo động",
  }

  const handlePrevPage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentEquipmentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentEquipmentPage(prev => Math.min(prev + 1, totalPages))
  }

  return (
    <Dialog open={!!data} onOpenChange={() => setEditingData(null)}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sửa cột điện</DialogTitle>
        </DialogHeader>
        <form onSubmit={edit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Thông tin chung</TabsTrigger>
              <TabsTrigger value="location">Vị trí</TabsTrigger>
              <TabsTrigger value="equipment">Thiết bị</TabsTrigger>
              <TabsTrigger value="notes">Ghi chú</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên cột <span className="text-destructive">*</span></Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Mã cột <span className="text-destructive">*</span></Label>
                      <Input 
                        id="code" 
                        name="code" 
                        value={formData.code} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Cột nối tiếp</Label>
                    <Input 
                      id="origin" 
                      name="origin" 
                      value={formData.origin} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <div className={`font-medium ${statusColors[data.activity]}`}>
                      {statusText[data.activity]}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="location">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Vĩ độ</Label>
                      <Input 
                        id="latitude" 
                        name="latitude" 
                        type="number" 
                        step="any" 
                        value={formData.latitude} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Kinh độ</Label>
                      <Input 
                        id="longitude" 
                        name="longitude" 
                        type="number" 
                        step="any" 
                        value={formData.longitude} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="h-[200px] bg-gray-100 rounded-md flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Bản đồ sẽ hiển thị ở đây</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="equipment">
              <Card>
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-center">
                    <Search className="w-5 h-5 text-gray-500 mr-2" />
                    <Input
                      placeholder="Tìm kiếm thiết bị..."
                      value={equipmentSearch}
                      onChange={(e) => setEquipmentSearch(e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên thiết bị</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEquipment.map(([itemId, itemName]) => (
                        <TableRow key={itemId}>
                          <TableCell className="font-medium">{itemName}</TableCell>
                          <TableCell>
                            <Select 
                              value={formData.items[itemId].status} 
                              onValueChange={(value) => handleSelectChange(value as Status, itemId)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue>
                                  {statusText[formData.items[itemId].status]}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={Status.Okay}>{statusText[Status.Okay]}</SelectItem>
                                <SelectItem value={Status.Warning}>{statusText[Status.Warning]}</SelectItem>
                                <SelectItem value={Status.Error}>{statusText[Status.Error]}</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={formData.items[itemId].note}
                              onChange={(e) => handleItemNoteChange(e, itemId)}
                              placeholder="Ghi chú"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      onClick={handlePrevPage}
                      disabled={currentEquipmentPage === 1}
                      variant="outline"
                      size="sm"
                      type="button"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Trước
                    </Button>
                    <span>
                      Trang {currentEquipmentPage} / {totalPages}
                    </span>
                    <Button
                      onClick={handleNextPage}
                      disabled={currentEquipmentPage === totalPages}
                      variant="outline"
                      size="sm"
                      type="button"
                    >
                      Sau
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea 
                      id="note" 
                      name="note" 
                      value={formData.note} 
                      onChange={handleInputChange}
                      rows={5} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full sm:w-auto">Cập nhật</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}