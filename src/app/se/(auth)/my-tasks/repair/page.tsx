"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { RepairSheet } from "../DocSheet"
import { RepairDocRaw } from "../doc_raw"
import { RepairData, PagingDoc } from "../doc_data"
import { repairDataProcessing } from "../doc_data_processing"
import { Doc } from "../doc_config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Tablist from "../tablist"

type TasksRawData = {
  data: {
    repairDoc: {
      total: number
      page: number
      repairDocs: Array<RepairDocRaw>
    }
    repairApproval: {
      total: number
      page: number
      repairDocs: Array<RepairDocRaw>
    }
    users: {
      [key: string]: string
    }
  }
  message: string
}

export default function RepairDone() {
  const [repairDocs, setRepairDocs] = useState<Array<RepairData>>([])
  const [repairAppDocs, setRepairAppDocs] = useState<Array<RepairData>>([])
  const [users, setUsers] = useState<{ [key: string]: string }>({})
  const [total, setTotal] = useState<PagingDoc>({ it: 0, ia: 0, rt: 0, ra: 0 })
  const [currentPage, setCurrentPage] = useState<PagingDoc>({ it: 0, ia: 0, rt: 1, ra: 1 })

  const fetchData = async (currentPage: PagingDoc) => {
    try {
      const response = await fetchWithToken(
        `${SE.API_WORKREPAIRDONE}?${new URLSearchParams({
          t_limit: String(Doc.limit),
          t_page: String(currentPage.rt),
          a_limit: String(Doc.limit),
          a_page: String(currentPage.ra),
        })}`
      )
      const data = response as TasksRawData

      if (!data.data) return

      setRepairDocs(data.data.repairDoc.repairDocs.map(repairDataProcessing))
      setRepairAppDocs(data.data.repairApproval.repairDocs.map(repairDataProcessing))
      setTotal({ 
        it: 0, 
        ia: 0, 
        rt: data.data.repairDoc.total, 
        ra: data.data.repairApproval.total 
      })
      setUsers(data.data.users)
    } catch (e) {
      if (e instanceof Error) toast.error(e.message)
    }
  }

  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage])

  const handlePageChange = (type: 'rt' | 'ra', change: number) => {
    setCurrentPage(prev => {
      const newPage = prev[type] + change
      const maxPage = Math.ceil(total[type] / Doc.limit)
      return { ...prev, [type]: Math.max(1, Math.min(newPage, maxPage)) }
    })
  }

  const renderPagination = (type: 'rt' | 'ra') => (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(type, -1)}
        disabled={currentPage[type] === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="text-sm font-medium">
        Page {currentPage[type]} of {Math.ceil(total[type] / Doc.limit)}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(type, 1)}
        disabled={currentPage[type] === Math.ceil(total[type] / Doc.limit)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )

  const renderRepairDocs = (docs: Array<RepairData>, type: 'rt' | 'ra') => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {docs.map((data) => (
        <Card key={data.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <RepairSheet
              username=""
              repairData={data}
              category=""
              tab="repair"
              fetchData={() => fetchData(currentPage)}
              currentPage={currentPage}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <Tablist active="repair" />
      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="completed">Phiếu sửa chữa hoàn tất</TabsTrigger>
          <TabsTrigger value="approved">Phiếu sửa chữa đã duyệt</TabsTrigger>
        </TabsList>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu sửa chữa hoàn tất</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRepairDocs(repairDocs, 'rt')}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Tổng số: {total.rt} phiếu</span>
                {renderPagination('rt')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu sửa chữa đã duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRepairDocs(repairAppDocs, 'ra')}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Tổng số: {total.ra} phiếu</span>
                {renderPagination('ra')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}