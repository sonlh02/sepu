"use client"

import { useEffect, useState } from "react"
import { getCookie } from 'cookies-next'
import { toast } from 'react-toastify'
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { InspectSheet, RepairSheet } from "./DocSheet"
import { InspectDocRaw, RepairDocRaw } from "./doc_raw"
import { InspectData, RepairData, PagingDoc } from "./doc_data"
import { inspectDataProcessing, repairDataProcessing } from "./doc_data_processing"
import { Doc } from "./doc_config"
import Pagination from "@/app/se/(auth)/Pagination"
import Tablist from "./tablist"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

type TasksRawData = {
  data: {
    inspectDoc: {
      total: number
      page: number
      inspectDocs: Array<InspectDocRaw>
    }
    repairDoc: {
      total: number
      page: number
      repairDocs: Array<RepairDocRaw>
    }
    inspectApproval: {
      total: number
      page: number
      inspectDocs: Array<InspectDocRaw>
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

export default function MyTasks() {
  const [username, setUsername] = useState<string>(getCookie("username") || "")
  const [inspectDocs, setInspectDocs] = useState<Array<InspectData>>([])
  const [repairDocs, setRepairDocs] = useState<Array<RepairData>>([])
  const [inspectAppDocs, setInspectAppDocs] = useState<Array<InspectData>>([])
  const [repairAppDocs, setRepairAppDocs] = useState<Array<RepairData>>([])
  const [users, setUsers] = useState<{ [key: string]: string }>({})
  const [total, setTotal] = useState<PagingDoc>({ it: 0, ia: 0, rt: 0, ra: 0 })
  const [currentPage, setCurrentPage] = useState<PagingDoc>({ it: 1, ia: 1, rt: 1, ra: 1 })
  const [currIT, setCurrIT] = useState(1)
  const [currIA, setCurrIA] = useState(1)
  const [currRT, setCurrRT] = useState(1)
  const [currRA, setCurrRA] = useState(1)

  function fetchData(currentPage: PagingDoc) {
    fetchWithToken(`${SE.API_WORKDOC}?${new URLSearchParams({
        it_limit: String(Doc.limit),
        it_page: String(currentPage.it),
        ia_limit: String(Doc.limit),
        ia_page: String(currentPage.ia),
        rt_limit: String(Doc.limit),
        rt_page: String(currentPage.rt),
        ra_limit: String(Doc.limit),
        ra_page: String(currentPage.ra),
      })}`)
      .then((response) => response as TasksRawData)
      .then((data) => {
        if (!data.data) return

        setInspectDocs(data.data.inspectDoc.inspectDocs.map(inspectDataProcessing))
        setRepairDocs(data.data.repairDoc.repairDocs.map(repairDataProcessing))
        setInspectAppDocs(data.data.inspectApproval.inspectDocs.map(inspectDataProcessing))
        setRepairAppDocs(data.data.repairApproval.repairDocs.map(repairDataProcessing))

        setTotal({ 
          it: data.data.inspectDoc.total, 
          ia: data.data.inspectApproval.total, 
          rt: data.data.repairDoc.total, 
          ra: data.data.repairApproval.total 
        })

        setUsers(data.data.users)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  useEffect(() => {
    setCurrentPage({ it: currIT, ia: currIA, rt: currRT, ra: currRA })
  }, [currIT, currIA, currRT, currRA])

  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage])

  const renderDocuments = (docs: Array<InspectData | RepairData>, type: 'inspect' | 'repair', category: 'task' | 'approval') => (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {docs.map((data) => (
          <Card key={data.id} className="overflow-hidden">
            <CardContent className="p-0">
              {type === 'inspect' ? (
                <InspectSheet
                  username={username}
                  inspectData={data as InspectData}
                  tab="index"
                  category={category}
                  fetchData={fetchData}
                  currentPage={currentPage}
                />
              ) : (
                <RepairSheet
                  username={username}
                  repairData={data as RepairData}
                  tab="index"
                  category={category}
                  fetchData={fetchData}
                  currentPage={currentPage}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )

  return (
    <div className="flex flex-col h-screen bg-background">
      <Tablist active="index" />
      <div className="flex-1 p-4 space-y-4">
        <Tabs defaultValue="inspect" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inspect">Phiếu kiểm tra</TabsTrigger>
            <TabsTrigger value="repair">Phiếu sửa chữa</TabsTrigger>
          </TabsList>
          <TabsContent value="inspect">
            <Card>
              <CardHeader>
                <CardTitle>Phiếu kiểm tra</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tasks">
                  <TabsList>
                    <TabsTrigger value="tasks">Nhiệm vụ</TabsTrigger>
                    <TabsTrigger value="approvals">Duyệt</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tasks">
                    {renderDocuments(inspectDocs, 'inspect', 'task')}
                    <div className="flex justify-between items-center mt-4">
                      <div>Tổng số: {total.it} phiếu</div>
                      <Pagination
                        pages={Math.ceil(total.it / Doc.limit)}
                        currentPage={currIT}
                        setCurrentPage={setCurrIT}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="approvals">
                    {renderDocuments(inspectAppDocs, 'inspect', 'approval')}
                    <div className="flex justify-between items-center mt-4">
                      <div>Tổng số: {total.ia} phiếu</div>
                      <Pagination
                        pages={Math.ceil(total.ia / Doc.limit)}
                        currentPage={currIA}
                        setCurrentPage={setCurrIA}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="repair">
            <Card>
              <CardHeader>
                <CardTitle>Phiếu sửa chữa</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tasks">
                  <TabsList>
                    <TabsTrigger value="tasks">Nhiệm vụ</TabsTrigger>
                    <TabsTrigger value="approvals">Duyệt</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tasks">
                    {renderDocuments(repairDocs, 'repair', 'task')}
                    <div className="flex justify-between items-center mt-4">
                      <div>Tổng số: {total.rt} phiếu</div>
                      <Pagination
                        pages={Math.ceil(total.rt / Doc.limit)}
                        currentPage={currRT}
                        setCurrentPage={setCurrRT}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="approvals">
                    {renderDocuments(repairAppDocs, 'repair', 'approval')}
                    <div className="flex justify-between items-center mt-4">
                      <div>Tổng số: {total.ra} phiếu</div>
                      <Pagination
                        pages={Math.ceil(total.ra / Doc.limit)}
                        currentPage={currRA}
                        setCurrentPage={setCurrRA}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}