"use client";

import { UserWright } from "@/enum/user_wright";
import { Pie } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useEffect, useState } from "react";
import menubar from "@/lib/menu";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { toast } from "react-toastify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

ChartJS.register(ArcElement, Tooltip, Legend);

type StatisticReportWorkprogressRawData = {
  data: {
    r_exp_submit: number;
    r_exp_complete: number;
    times_repair: number;
    times_inspect: number;
    r_processing: number;
    r_completed: number;
    i_exp_submit: number;
    i_completed: number;
    i_processing: number;
    i_exp_complete: number;
  };
};

export type StatisticReportWorkprogressData = {
  r_exp_submit: number;
  r_exp_complete: number;
  times_repair: number;
  times_inspect: number;
  r_processing: number;
  r_completed: number;
  i_exp_submit: number;
  i_completed: number;
  i_processing: number;
  i_exp_complete: number;
};

type SelectOption = { value: string; label: string };

export default function StatisticReportDoc() {
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [statType, setStatType] = useState("month");
  const [statisticYear, setStatisticYear] =
    useState<StatisticReportWorkprogressData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [statisticMonth, setStatisticMonth] =
    useState<StatisticReportWorkprogressData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
      2,
      "0"
    )}`
  );
  const [statisticDay, setStatisticDay] =
    useState<StatisticReportWorkprogressData | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    setUserWright(menubar("statistic") ? UserWright.Write : UserWright.None);
  }, []);

  function fetchStatisticData(type: 'year' | 'month' | 'day', value: number | string, e_day?: string) {
    let params: Record<string, string> = {};
  
    if (type === 'year') {
      params = { year: value as string };
    } else if (type === 'month') {
      params = { month: value as string };
    } else if (type === 'day' && e_day) {
      params = { s_day: value as string, e_day };
    }
  
    fetchWithToken(
      `${SE.API_STATISTIC_REPORT_WORKPROGRESS}?${new URLSearchParams(params)}`
    )
      .then((response) => response as StatisticReportWorkprogressRawData)
      .then((data) => {
        if (!data || !data.data) {
          return;
        }
  
        const statisticReportWorkprogressData: StatisticReportWorkprogressData = 
        {
          r_exp_submit: data.data.r_exp_submit,
          r_exp_complete: data.data.r_exp_complete,
          times_repair: data.data.times_repair,
          times_inspect: data.data.times_inspect,
          r_processing: data.data.r_processing,
          r_completed: data.data.r_completed,
          i_exp_submit: data.data.i_exp_submit,
          i_completed: data.data.i_completed,
          i_processing: data.data.i_processing,
          i_exp_complete: data.data.i_exp_complete,
        };
  
        if (type === 'year') {
          setStatisticYear(statisticReportWorkprogressData);
        } else if (type === 'month') {
          setStatisticMonth(statisticReportWorkprogressData);
        } else if (type === 'day') {
          setStatisticDay(statisticReportWorkprogressData);
        }
      })
      .catch((e) => {
        if (e.message) toast.error(e.message);
      });
  }  

  useEffect(() => {
    if (selectedYear) {
      fetchStatisticData('year', selectedYear);
    }
  }, [selectedYear]);
  
  useEffect(() => {
    if (selectedMonth) {
      fetchStatisticData('month', selectedMonth);
    }
  }, [selectedMonth]);
  
  useEffect(() => {
    if (startDate && endDate) {
      fetchStatisticData('day', startDate, endDate);
    }
  }, [startDate, endDate]);

  const renderYearOptions = (): JSX.Element[] => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => {
      const year = currentYear - index;
      return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
    });
  };

  const renderMonthOptions = (): JSX.Element[] => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const monthsToShow = 12;

    const options: JSX.Element[] = [];
    for (let i = 0; i < monthsToShow; i++) {
      const month = currentMonth - i;
      const year = month <= 0 ? currentYear - 1 : currentYear;
      const formattedMonth = month <= 0 ? month + 12 : month;
      const value = `${year}-${String(formattedMonth).padStart(2, "0")}`;
      options.push(
        <SelectItem key={value} value={value}>
          {value}
        </SelectItem>
      );
    }

    return options;
  };

  const renderPieChart = (data: StatisticReportWorkprogressData | null) => {
    if (!data) return null;

    const chartDataInspect = {
      labels: [
        "Phiếu quá hạn nộp",
        "Phiếu quá hạn hoàn thành",
        "Phiếu hoàn thành",
        "Phiếu đang thực hiện",
      ],
      datasets: [
        {
          data: [
            data.i_exp_submit,
            data.i_exp_complete,
            data.i_completed,
            data.i_processing,
          ],
          backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4CAF50"],
          hoverBackgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4CAF50"],
        },
      ],
    };

    const chartDataRepair = {
      labels: [
        "Phiếu quá hạn nộp",
        "Phiếu quá hạn hoàn thành",
        "Phiếu hoàn thành",
        "Phiếu đang thực hiện",
      ],
      datasets: [
        {
          data: [
            data.r_exp_submit,
            data.r_exp_complete,
            data.r_completed,
            data.r_processing,
          ],
          backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4CAF50"],
          hoverBackgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4CAF50"],
        },
      ],
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Tiến độ kiểm tra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-square">
                <Pie data={chartDataInspect} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Tiến độ sửa chữa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-square">
                <Pie data={chartDataRepair} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-2">
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ tiến độ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
            <Select
              value={statType}
              onValueChange={(value) => setStatType(value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
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
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {renderYearOptions()}
                </SelectContent>
              </Select>
            )}

            {statType === "month" && (
              <Select
                value={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {renderMonthOptions()}
                </SelectContent>
              </Select>
            )}

            {statType === "day" && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="startDate">Từ ngày:</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
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

          {statType === "year" && renderPieChart(statisticYear)}
          {statType === "month" && renderPieChart(statisticMonth)}
          {statType === "day" && renderPieChart(statisticDay)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê phiếu kiểm tra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{statType === "year" ? statisticYear?.i_exp_submit : statType === "month" ? statisticMonth?.i_exp_submit : statisticDay?.i_exp_submit || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Phiếu quá hạn nộp</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{statType === "year" ? statisticYear?.i_exp_complete : statType === "month" ? statisticMonth?.i_exp_complete : statisticDay?.i_exp_complete || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Phiếu quá hạn hoàn thành</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{statType === "year" ? statisticYear?.i_completed : statType === "month" ? statisticMonth?.i_completed : statisticDay?.i_completed || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Phiếu hoàn thành</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{statType === "year" ? statisticYear?.i_processing : statType === "month" ? statisticMonth?.i_processing : statisticDay?.i_processing || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Phiếu đang thực hiện</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{statType === "year" ? statisticYear?.r_exp_submit : statType === "month" ? statisticMonth?.r_exp_submit : statisticDay?.r_exp_submit || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Phiếu quá hạn nộp</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{statType === "year" ? statisticYear?.r_exp_complete : statType === "month" ? statisticMonth?.r_exp_complete : statisticDay?.r_exp_complete || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Phiếu quá hạn hoàn thành</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{statType === "year" ? statisticYear?.r_completed : statType === "month" ? statisticMonth?.r_completed : statisticDay?.r_completed || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Phiếu hoàn thành</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{statType === "year" ? statisticYear?.r_processing : statType === "month" ? statisticMonth?.r_processing : statisticDay?.r_processing || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Phiếu đang thực hiện</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}