"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { toast } from "react-toastify"

import { fetchWithToken } from "@/lib/fetch_data"
import { SE } from "@/lib/api"
import menubar from "@/lib/menu"
import { UserWright } from "@/enum/user_wright"
import UserDontAccessPage from "@/component/NotAllow"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type StatisticRawData = {
  data: {
    num_repair_route: number;
    times_repair: number;
    num_incident_fly: number;
    route_max_incident_cam: string;
    times_inspect: number;
    num_inspect_route: number;
    num_incident_cam: number;
    route_max_incident_fly: string;
  };
};

export type StatisticData = {
  num_repair_route: number;
  times_repair: number;
  num_incident_fly: number;
  route_max_incident_cam: string;
  times_inspect: number;
  num_inspect_route: number;
  num_incident_cam: number;
  route_max_incident_fly: string;
};

type ChartRawData = {
  data: {
    label: string[];
    value: {
      incident_flies: [string, number][];
      repair_docs: [string, number][];
      inspect_docs: [string, number][];
      incident_cams: [string, number][];
    };
  };
};

export type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
};

type SelectOption = { value: string; label: string };

export default function Statistics() {
  const [statisticYear, setStatisticYear] = useState<StatisticData | null>(
    null
  );
  const [statisticMonth, setStatisticMonth] = useState<StatisticData | null>(
    null
  );
  const [statisticDay, setStatisticDay] = useState<StatisticData | null>(null);
  const [statType, setStatType] = useState("month");
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
      2,
      "0"
    )}`
  );
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [barChartData, setBarChartData] = useState<ChartData[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("month");

  useEffect(() => {
    setUserWright(menubar("statistic") ? UserWright.Write : UserWright.None);
  }, []);

  function fetchDataByYear(year: number) {
    const params = { year };

    fetchWithToken(
      `${SE.API_STATISTIC_REPORT_GENERAL}?${new URLSearchParams(params as any)}`
    )
      .then((response) => response as StatisticRawData)
      .then((data) => {
        if (!data || !data.data) {
          return;
        }

        const statisticData: StatisticData = {
          num_repair_route: data.data.num_repair_route,
          times_repair: data.data.times_repair,
          num_incident_fly: data.data.num_incident_fly,
          route_max_incident_cam: data.data.route_max_incident_cam,
          times_inspect: data.data.times_inspect,
          num_inspect_route: data.data.num_inspect_route,
          num_incident_cam: data.data.num_incident_cam,
          route_max_incident_fly: data.data.route_max_incident_fly,
        };

        setStatisticYear(statisticData);
      })
      .catch((e) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (selectedYear) {
      fetchDataByYear(selectedYear);
    }
  }, [selectedYear]);

  function fetchDataByMonth(month: string) {
    const params = { month };

    fetchWithToken(
      `${SE.API_STATISTIC_REPORT_GENERAL}?${new URLSearchParams(params)}`
    )
      .then((response) => response as StatisticRawData)
      .then((data) => {
        if (!data || !data.data) {
          return;
        }

        const statisticData: StatisticData = {
          num_repair_route: data.data.num_repair_route,
          times_repair: data.data.times_repair,
          num_incident_fly: data.data.num_incident_fly,
          route_max_incident_cam: data.data.route_max_incident_cam,
          times_inspect: data.data.times_inspect,
          num_inspect_route: data.data.num_inspect_route,
          num_incident_cam: data.data.num_incident_cam,
          route_max_incident_fly: data.data.route_max_incident_fly,
        };

        setStatisticMonth(statisticData);
      })
      .catch((e) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (selectedMonth) {
      fetchDataByMonth(selectedMonth);
    }
  }, [selectedMonth]);

  function fetchDataByDate(s_day: string, e_day: string) {
    const params = { s_day, e_day };

    fetchWithToken(
      `${SE.API_STATISTIC_REPORT_GENERAL}?${new URLSearchParams(params)}`
    )
      .then((response) => response as StatisticRawData)
      .then((data) => {
        if (!data || !data.data) {
          return;
        }

        const statisticData: StatisticData = {
          num_repair_route: data.data.num_repair_route,
          times_repair: data.data.times_repair,
          num_incident_fly: data.data.num_incident_fly,
          route_max_incident_cam: data.data.route_max_incident_cam,
          times_inspect: data.data.times_inspect,
          num_inspect_route: data.data.num_inspect_route,
          num_incident_cam: data.data.num_incident_cam,
          route_max_incident_fly: data.data.route_max_incident_fly,
        };

        setStatisticDay(statisticData);
      })
      .catch((e) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (startDate && endDate) {
      fetchDataByDate(startDate, endDate);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    function sortDataByLabel(
      data: [string, number][],
      labels: string[]
    ): number[] {
      const sortedData: number[] = [];
      labels.forEach((label) => {
        const found = data.find((item) => item[0] === label);
        if (found) {
          sortedData.push(found[1]);
        } else {
          sortedData.push(0);
        }
      });
      return sortedData;
    }

    function fetchDataChart(schedule: string) {
      const params = { schedule };
      fetchWithToken(`${SE.API_STATISTIC_CHART}?${new URLSearchParams(params)}`)
        .then((response) => response as ChartRawData)
        .then((data) => {
          if (!data || !data.data) {

            return;
          }
          const { label, value } = data.data;

          const datasets: ChartData[] = [
            {
              labels: label,
              datasets: [
                {
                  label: "Số lần kiểm tra",
                  data: sortDataByLabel(value.inspect_docs, label),
                  backgroundColor: "rgba(255, 206, 86, 0.2)",
                  borderColor: "rgba(255, 206, 86, 1)",
                  borderWidth: 1,
                },
              ],
            },
            // {
            //   labels: label,
            //   datasets: [
            //     {
            //       label: "Số lần sửa chữa",
            //       data: sortDataByLabel(value.repair_docs, label),
            //       backgroundColor: "rgba(54, 162, 235, 0.2)",
            //       borderColor: "rgba(54, 162, 235, 1)",
            //       borderWidth: 1,
            //     },
            //   ],
            // },
            {
              labels: label,
              datasets: [
                {
                  label: "Số lỗi phát hiện khi bay",
                  data: sortDataByLabel(value.incident_flies, label),
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  borderColor: "rgba(255, 99, 132, 1)",
                  borderWidth: 1,
                },
              ],
            },
            {
              labels: label,
              datasets: [
                {
                  label: "Số lỗi từ camera",
                  data: sortDataByLabel(value.incident_cams, label),
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            },
          ];

          setBarChartData(datasets);
        })
        .catch((e) => {
          if (e.message) toast.error(e.message);
        });
    }

    if (selectedSchedule) {
      fetchDataChart(selectedSchedule);
    }
  }, [selectedSchedule]);

  if (!userWright) return null
  if (userWright === UserWright.None) return <UserDontAccessPage />

  const renderYearOptions = (): { value: string; label: string }[] => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, index) => {
      const year = currentYear - index
      return { value: year.toString(), label: year.toString() }
    })
  }

  const renderMonthOptions = (): { value: string; label: string }[] => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const monthsToShow = 12

    const options: { value: string; label: string }[] = []
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

  return (
    <div className="space-y-4 p-2">
      <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl">Biểu đồ</AccordionTrigger>
          <AccordionContent>
            <div className="flex justify-end mb-4 p-1">
              <Select
                value={selectedSchedule}
                onValueChange={(value) => setSelectedSchedule(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="year">Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {barChartData.map((chartData, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                              precision: 0,
                            },
                          },
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full">
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-2xl">Tổng quan</AccordionTrigger>
          <AccordionContent>
            <div className="flex mb-4">
              <div className="flex items-center justify-between w-full p-1">
                <Select
                  value={statType}
                  onValueChange={(value) => setStatType(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chọn loại thống kê" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year">Thống kê theo năm</SelectItem>
                    <SelectItem value="month">Thống kê theo tháng</SelectItem>
                    <SelectItem value="day">Thống kê theo ngày</SelectItem>
                  </SelectContent>
                </Select>
                {statType === "year" && (
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-[180px] ml-4">
                      <SelectValue placeholder="Chọn năm" />
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
                  <Select
                    value={selectedMonth}
                    onValueChange={(value) => setSelectedMonth(value)}
                  >
                    <SelectTrigger className="w-[180px] ml-4">
                      <SelectValue placeholder="Chọn tháng" />
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
                  <div className="flex ml-4">
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

          {statType === "year" && (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Số lần kiểm tra", value: statisticYear?.times_inspect || 0 },
                // { title: "Số lần sửa chữa", value: statisticYear?.times_repair || 0 },
                { title: "Số tuyến kiểm tra", value: statisticYear?.num_inspect_route || 0 },
                //{ title: "Số tuyến sửa chữa", value: statisticYear?.num_repair_route || 0 },
                { title: "Số lỗi phát hiện khi bay", value: statisticYear?.num_incident_fly || 0 },
                { title: "Số lỗi camera phát hiện", value: statisticYear?.num_incident_cam || 0 },
                { title: "Tuyến gặp nhiều lỗi (phát hiện khi bay)", value: statisticYear?.route_max_incident_fly || "-" },
                { title: "Tuyến gặp nhiều lỗi (camera giám sát)", value: statisticYear?.route_max_incident_cam || "-" },
              ].map((item, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {statType === "month" && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Số lần kiểm tra", value: statisticMonth?.times_inspect || 0 },
              //{ title: "Số lần sửa chữa", value: statisticMonth?.times_repair || 0 },
              { title: "Số tuyến kiểm tra", value: statisticMonth?.num_inspect_route || 0 },
              //{ title: "Số tuyến sửa chữa", value: statisticMonth?.num_repair_route || 0 },
              { title: "Số lỗi phát hiện khi bay", value: statisticMonth?.num_incident_fly || 0 },
              { title: "Số lỗi camera phát hiện", value: statisticMonth?.num_incident_cam || 0 },
              { title: "Tuyến gặp nhiều lỗi (phát hiện khi bay)", value: statisticMonth?.route_max_incident_fly || "-" },
              { title: "Tuyến gặp nhiều lỗi (camera giám sát)", value: statisticMonth?.route_max_incident_cam || "-" },
            ].map((item, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {statType === "day" && (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Số lần kiểm tra", value: statisticDay?.times_inspect || 0 },
              //{ title: "Số lần sửa chữa", value: statisticDay?.times_repair || 0 },
              { title: "Số tuyến kiểm tra", value: statisticDay?.num_inspect_route || 0 },
              //{ title: "Số tuyến sửa chữa", value: statisticDay?.num_repair_route || 0 },
              { title: "Số lỗi phát hiện khi bay", value: statisticDay?.num_incident_fly || 0 },
              { title: "Số lỗi camera phát hiện", value: statisticDay?.num_incident_cam || 0 },
              { title: "Tuyến gặp nhiều lỗi (phát hiện khi bay)", value: statisticDay?.route_max_incident_fly || "-" },
              { title: "Tuyến gặp nhiều lỗi (camera giám sát)", value: statisticDay?.route_max_incident_cam || "-" },
            ].map((item, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{item.value}</p>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}