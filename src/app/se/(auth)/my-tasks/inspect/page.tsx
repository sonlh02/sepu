"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { InspectSheet } from "../DocSheet"
import { InspectDocRaw } from "../doc_raw"
import { InspectData, PagingDoc } from "../doc_data"
import { inspectDataProcessing } from "../doc_data_processing"
import { Doc } from "../doc_config"
import Pagination from "@/app/se/(auth)/Pagination"
import Tablist from "../tablist"
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
    inspectApproval: {
      total: number
      page: number
      inspectDocs: Array<InspectDocRaw>
    }
    users: {
      [key: string]: string
    }
  }
  message: string
}

export default function InspectDone() {
  const [inspectDocs, setInspectDocs] = useState<Array<InspectData>>([])
  const [inspectAppDocs, setInspectAppDocs] = useState<Array<InspectData>>([])
  const [users, setUsers] = useState<{ [key: string]: string }>({})
  const [total, setTotal] = useState<PagingDoc>({ it: 0, ia: 0, rt: 0, ra: 0 })
  const [currentPage, setCurrentPage] = useState<PagingDoc>({ it: 1, ia: 1, rt: 0, ra: 0 })
  const [currIT, setCurrIT] = useState(1)
  const [currIA, setCurrIA] = useState(1)

  function fetchData(currentPage: PagingDoc) {
    fetchWithToken(
      `${SE.API_WORKINSPECTDONE}?${new URLSearchParams({
        t_limit: String(Doc.limit),
        t_page: String(currentPage.it),
        a_limit: String(Doc.limit),
        a_page: String(currentPage.ia),
      })}`
    )
      .then((response) => response as TasksRawData)
      .then((data) => {
        if (!data.data) return

        setInspectDocs(
          data.data.inspectDoc.inspectDocs.map((docRawData) =>
            inspectDataProcessing(docRawData)
          )
        )

        setInspectAppDocs(
          data.data.inspectApproval.inspectDocs.map((docRawData) =>
            inspectDataProcessing(docRawData)
          )
        )

        setTotal({ 
          it: data.data.inspectDoc.total, 
          ia: data.data.inspectApproval.total, 
          rt: 0, 
          ra: 0 
        })

        setUsers(data.data.users)
      })
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }

  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage])

  useEffect(() => {
    setCurrentPage({
      it: currIT,
      ia: currIA,
      rt: 0,
      ra: 0,
    })
  }, [currIT, currIA])

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8">
      <Tablist active="inspect" />

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Phiếu Kiểm Tra</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inspect" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inspect">Phiếu thực hiện</TabsTrigger>
              <TabsTrigger value="approved">Phiếu đã duyệt</TabsTrigger>
            </TabsList>
            <TabsContent value="inspect">
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inspectDocs.map((data, index) => (
                    <motion.div
                      key={data.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <InspectSheet
                        username=""
                        inspectData={data}
                        category=""
                        tab="inspect"
                        fetchData={fetchData}
                        currentPage={currentPage}
                      />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tổng số: {total.it} phiếu</span>
                <Pagination
                  pages={Math.ceil(total.it / Doc.limit)}
                  currentPage={currIT}
                  setCurrentPage={setCurrIT}
                />
              </div>
            </TabsContent>
            <TabsContent value="approved">
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inspectAppDocs.map((data, index) => (
                    <motion.div
                      key={data.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <InspectSheet
                        username=""
                        inspectData={data}
                        category=""
                        tab="inspect"
                        fetchData={fetchData}
                        currentPage={currentPage}
                      />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tổng số: {total.ia} phiếu</span>
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
    </div>
  )
}