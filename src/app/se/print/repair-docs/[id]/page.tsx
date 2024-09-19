"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Moment from "moment"
import Image from "next/image"
import menubar from "@/lib/menu"
import { UserWright } from "@/enum/user_wright"
import { fetchRepairData } from "@/app/se/(auth)/(menu)/repair-docs/fetch_repair_data"
import { RepairData } from "@/app/se/(auth)/(menu)/repair-docs/repair_data"
import UserDontAccessPage from "@/component/NotAllow"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PrintRepairDoc({ params }: { params: { id: string } }) {
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [data, setData] = useState<RepairData | null>()

  useEffect(() => {
    if (menubar("repairdoc")) {
      setUserWright(UserWright.Write)
    } else if (menubar("repairdoc-view")) {
      setUserWright(UserWright.Read)
    } else {
      setUserWright(UserWright.None)
    }

    const id = Number(params.id) || 0
    fetchRepairData(id)
      .then((response) => setData(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message)
      })
  }, [params])

  if (!userWright) return null
  if (userWright === UserWright.None) return <UserDontAccessPage />
  if (!data) return null

  const DottedLines = () => (
    <div className="mt-4">
      <div className="border-b border-dotted border-gray-400 my-2 mt-8"></div>
      <div className="border-b border-dotted border-gray-400 my-2 mt-8"></div>
      <div className="border-b border-dotted border-gray-400 my-2 mt-8"></div>
    </div>
  )

  return (
    <div className="h-screen">
      <div className="max-w-4xl mx-auto my-8 bg-background p-8">
        <div className="text-center space-y-2 mb-8">
          <div className="flex justify-between items-start">
            <div className="text-center">
              <h3 className="font-semibold text-lg">Tổng công ty Điện lực TP Hà Nội</h3>
              <h4 className="font-medium">Công ty lưới điện Cao thế Hà Nội</h4>
              <p className="text-sm font-semibold underline">Đội đường dây</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Cộng hòa xã hội chủ nghĩa Việt Nam</h3>
              <p className="text-sm">Độc lập - Tự do - Hạnh phúc</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold pt-4">
            PHIẾU SỬA CHỮA ĐƯỜNG DÂY CAO THẾ
          </h1>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><span className="font-semibold">Mã phiếu:</span> {data.code}</p>
            <p><span className="font-semibold">Ngày sửa chữa:</span> {Moment(data.date).format("DD-MM-YYYY")}</p>
            <p className="col-span-2"><span className="font-semibold">Tên tuyến đường dây:</span> {data.powerline.name} ({data.powerline.code})</p>
            <p className="col-span-2"><span className="font-semibold">Biện pháp an toàn:</span> {data.prepare}</p>
            <p className="col-span-2"><span className="font-semibold">Danh sách cột sửa chữa:</span> {data.powers.join(", ")}</p>
            <p className="col-span-2"><span className="font-semibold">Nhiệm vụ sửa chữa:</span> {data.tasks}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">Danh sách đội sửa chữa:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">TT</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Chức danh</TableHead>
                  <TableHead>Bậc thợ</TableHead>
                  <TableHead>Bậc AT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.workers.map((worker, index) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{worker.name}</TableCell>
                    <TableCell>{worker.position}</TableCell>
                    <TableCell>{worker.workLevel}</TableCell>
                    <TableCell>{worker.safeLevel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">1. Kết quả sửa chữa</h3>
            {data.result ? (
              <p className="ml-4 text-sm">{data.result}</p>
            ) : (
              <DottedLines />
            )}
            <DottedLines />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">2. Vấn đề còn tồn tại</h3>
            {data.unresolved ? (
              <p className="ml-4 text-sm">{data.unresolved}</p>
            ) : (
              <DottedLines />
            )}
            <DottedLines />
          </div>

          <Separator />

          <div className="flex justify-between mt-8">
            <div className="w-3/4 flex">
              {data.approvers.map((approver) => (
                <div key={approver.username} className="w-1/3 text-center">
                  <p className="font-semibold mb-2">{approver.represent}</p>
                  <div className="mt-4">
                    {approver.signature ? (
                      <Image
                        className="w-[150px] h-auto object-contain mx-auto"
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${approver.signature}`}
                        alt="Chữ ký"
                        width={150}
                        height={75}
                      />
                    ) : (
                      <div className="h-20 border border-dashed border-gray-300 rounded-md"></div>
                    )}
                    <p className="mt-2 text-sm">{approver.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="font-semibold mb-2">Đội sửa chữa</p>
              <div className="mt-4 space-y-4">
                {data.workers.map((worker) => (
                  <div key={worker.id}>
                    {worker.signature ? (
                      <Image
                        className="w-[150px] h-auto object-contain mx-auto"
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${worker.signature}`}
                        alt="Chữ ký"
                        width={150}
                        height={75}
                      />
                    ) : (
                      <div className="h-20 border border-dashed border-gray-300 rounded-md"></div>
                    )}
                    <p className="mt-2 text-sm">{worker.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}