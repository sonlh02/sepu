'use client'

import { UserWright } from "@/enum/user_wright"
import { Pie } from "react-chartjs-2"
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"
import { useEffect, useState } from "react"
import menubar from "@/lib/menu"
import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import { toast } from "react-toastify"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

ChartJS.register(ArcElement, Tooltip, Legend)

type StatisticReportDocRawData = {
  data: {
    i_new: number
    r_new: number
    times_inspect: number
    times_repair: number
    i_submitted: number
    r_submitted: number
    i_processing: number
    r_processing: number
    i_completed: number
    r_completed: number
  }
}

export type StatisticReportDocData = {
  i_new: number
  r_new: number
  times_inspect: number
  times_repair: number
  i_submitted: number
  r_submitted: number
  i_processing: number
  r_processing: number
  i_completed: number
  r_completed: number
}

type SelectOption = { value: string; label: string }

export default function StatisticReportDoc() {
  const [userWright, setUserWright] = useState<UserWright | null>(null)
  const [statType, setStatType] = useState("month")
  const [statisticYear, setStatisticYear] = useState<StatisticReportDocData | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [statisticMonth, setStatisticMonth] = useState<StatisticReportDocData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [statisticDay, setStatisticDay] = useState<StatisticReportDocData | null>(null)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  useEffect(() => {
    setUserWright(menubar("statistic") ? UserWright.Write : UserWright.None)
  }, [])

  function fetchStatisticData(type: 'year' | 'month' | 'day', value: number | string, e_day?: string) {
    let params: Record<string, string> = {}
  
    if (type === 'year') {
      params = { year: value as string }
    } else if (type === 'month') {
      params = { month: value as string }
    } else if (type === 'day' && e_day) {
      params = { s_day: value as string, e_day }
    }
  
    fetchWithToken(
      `${SE.API_STATISTIC_REPORT_DOC}?${new URLSearchParams(params)}`
    )
      .then((response) => response as StatisticReportDocRawData)
      .then((data) => {
        if (!data || !data.data) {
          return
        }
  
        const statisticReportDocData: StatisticReportDocData = {
          i_new: data.data.i_new,
          r_new: data.data.r_new,
          times_inspect: data.data.times_inspect,
          times_repair: data.data.times_repair,
          i_submitted: data.data.i_submitted,
          r_submitted: data.data.r_submitted,
          i_processing: data.data.i_processing,
          r_processing: data.data.r_processing,
          i_completed: data.data.i_completed,
          r_completed: data.data.r_completed,
        }
  
        if (type === 'year') {
          setStatisticYear(statisticReportDocData)
        } else if (type === 'month') {
          setStatisticMonth(statisticReportDocData)
        } else if (type === 'day') {
          setStatisticDay(statisticReportDocData)
        }
      })
      .catch((e) => {
        if (e.message) toast.error(e.message)
      })
  }  

  useEffect(() => {
    if (selectedYear) {
      fetchStatisticData('year', selectedYear)
    }
  }, [selectedYear])
  
  useEffect(() => {
    if (selectedMonth) {
      fetchStatisticData('month', selectedMonth)
    }
  }, [selectedMonth])
  
  useEffect(() => {
    if (startDate && endDate) {
      fetchStatisticData('day', startDate, endDate)
    }
  }, [startDate, endDate])

  const renderYearOptions = (): SelectOption[] => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, index) => {
      const year = currentYear - index
      return { value: year.toString(), label: year.toString() }
    })
  }

  const renderMonthOptions = (): SelectOption[] => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const monthsToShow = 12

    const options: SelectOption[] = []
    for (let i = 0; i < monthsToShow; i++) {
      const month = currentMonth - i
      const year = month <= 0 ? currentYear - 1 : currentYear
      const formattedMonth = month <= 0 ? month + 12 : month
      options.push({
        value: `${year}-${String(formattedMonth).padStart(2, "0")}`,
        label: `${year}-${String(formattedMonth).padStart(2, "0")}`,
      })
    }

    return options
  }

  const renderPieChart = (data: StatisticReportDocData | null) => {
    if (!data) return null

    const chartData = {
      labels: ["Phiếu kiểm tra", "Phiếu sửa chữa"],
      datasets: [
        {
          data: [data.times_inspect, data.times_repair],
          backgroundColor: ["#36A2EB", "#FF6384"],
          hoverBackgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    }

    return (
      <div className="w-full flex justify-center">
        <div className="w-96 h-96">
          <Pie data={chartData} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-2">
      <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl">Biểu đồ phiếu công việc</AccordionTrigger>
          <AccordionContent>
            <div className="flex mb-4">
              <div className="flex items-center justify-between w-full p-1">
                <Select onValueChange={(value) => setStatType(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Thống kê theo tháng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year">Thống kê theo năm</SelectItem>
                    <SelectItem value="month">Thống kê theo tháng</SelectItem>
                    <SelectItem value="day">Thống kê theo ngày</SelectItem>
                  </SelectContent>
                </Select>
                {statType === "year" && (
                  <Select onValueChange={(value) => setSelectedYear(Number(value))}>
                    <SelectTrigger className="w-[180px] ml-4">
                      <SelectValue placeholder="2024" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderYearOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {statType === "month" && (
                  <Select onValueChange={(value) => setSelectedMonth(value)}>
                    <SelectTrigger className="w-[180px] ml-4">
                      <SelectValue placeholder={selectedMonth} />
                    </SelectTrigger>
                    <SelectContent>
                      {renderMonthOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {statType === "day" && (
                  <div className="flex">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="startDate">Từ ngày:</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate || ""}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Label htmlFor="endDate">đến ngày:</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate || ""}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {statType === "year" && renderPieChart(statisticYear)}
            {statType === "month" && renderPieChart(statisticMonth)}
            {statType === "day" && renderPieChart(statisticDay)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê phiếu kiểm tra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="text-center p-6">
                <p className="text-2xl font-bold">
                  {statType === "year" ? statisticYear?.i_new :
                   statType === "month" ? statisticMonth?.i_new :
                   statisticDay?.i_new || 0}
                </p>
                <p>Phiếu mới</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6 bg-blue-100">
                <p className="text-2xl font-bold">
                  {statType === "year" ? statisticYear?.i_processing :
                   statType === "month" ? statisticMonth?.i_processing :
                   statisticDay?.i_processing || 0}
                </p>
                <p>Phiếu đang thực hiện</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6 bg-purple-100">
                <p className="text-2xl font-bold">
                  {statType === "year" ? statisticYear?.i_submitted :
                   statType === "month" ? statisticMonth?.i_submitted :
                   statisticDay?.i_submitted || 0}
                </p>
                <p>Phiếu đã gửi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6 bg-green-100">
                <p className="text-2xl font-bold">
                  {statType === "year" ? statisticYear?.i_completed :
                   statType === "month" ? statisticMonth?.i_completed :
                   statisticDay?.i_completed || 0}
                </p>
                <p>Phiếu hoàn thành</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê phiếu sửa chữa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="text-center p-6">
                <p className="text-2xl font-bold">
                  {statType === "year" ? statisticYear?.r_new :
                   statType === "month" ? statisticMonth?.r_new :
                   statisticDay?.r_new || 0}
                </p>
                <p>Phiếu mới</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6 bg-blue-100">
                <p className="text-2xl font-bold">
                  {statType === "year" ? statisticYear?.r_processing :
                   statType === "month" ? statisticMonth?.r_processing :
                   statisticDay?.r_processing || 0}
                </p>
                <p>Phiếu đang thực hiện</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6 bg-purple-100">
                <p className="text-2xl font-bold">
                  {statType === "year" ? statisticYear?.r_submitted :
                   statType === "month" ? statisticMonth?.r_submitted :
                   statisticDay?.r_submitted || 0}
                </p>
                <p>Phiếu đã gửi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6 bg-green-100">
                <p className="text-2xl font-bold">
                  {statType === "year" ? statisticYear?.r_completed :
                   statType === "month" ? statisticMonth?.r_completed :
                   statisticDay?.r_completed || 0}
                </p>
                <p>Phiếu hoàn thành</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}