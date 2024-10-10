"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { ProfileData, ProfileRawData } from "../profile/profile_data";
import { Gender } from "@/enum/gender";
import { toast } from "react-toastify";
import { Pie } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { InspectData } from "../(menu)/inspect-docs/inspect_data";
import Moment from "moment";
import { InspectType } from "@/enum/inspect_type";
import { InspectStatus, RepairStatus } from "@/enum/doc_status";
import menubar from "@/lib/menu";
import { UserWright } from "@/enum/user_wright";
import _ from "lodash";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RepairData } from "../(menu)/repair-docs/repair_data";
import Link from "next/link";
import { Nav } from "@/lib/nav";

ChartJS.register(ArcElement, Tooltip, Legend);

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

type InspectsRawData = {
  data: {
    total: number;
    page: number;
    inspect_docs: Array<{
      id: number;
      docNo: string;
      type: "D" | "N";
      dateInspect: string;
      route: {
        id: number;
        name: string;
        code: string;
      };
      powerFi: {
        id: number;
        name: string;
        code: string;
        latitude: number;
        longitude: number;
      };
      powerTi: {
        id: number;
        name: string;
        code: string;
        latitude: number;
        longitude: number;
      };
      routeCode: string;
      powerFrom: string;
      powerTo: string;
      methodInspect: string;
      status: 1 | 2 | 3 | 4 | 5 | 6;
      inspectTeams: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7;
        lvSafe: 1 | 2 | 3 | 4 | 5;
        leader?: boolean;
        signature?: string;
      }>;
      inspectApprovals: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        represent: string;
        signature: string;
        confirm?: boolean;
      }>;
      inspectWorkstations: Array<{
        id: number;
        workstation: {
          id: number;
          name: string;
          code: string;
          activity: boolean;
        };
      }>;
      inspectFlycams: Array<{
        id: number;
        flycam: {
          id: number;
          name: string;
          code: string;
          activity: boolean;
        };
      }>;
      inspectImages: Array<{
        id: number;
        visualData: {
          id: number;
          path: string;
          image: string;
        };
      }>;
      incidentFlies: Array<{
        id: number;
        power: {
          id: number;
          name: string;
          code: string;
          latitude: number;
          longitude: number;
        };
        pole?: string;
        line?: string;
        latitude: number;
        longitude: number;
        altitude: number;
        incident: string;
        incidentType: string;
        dateWarning: string;
        lvWarning: null;
        visualData: {
          id: number;
          path: string;
          image: string;
        };
      }>;
      inspectResults: Array<{
        id: number;
        keyword: string;
        title: string;
        result: string;
        pos: number;
      }>;
      workstation: string;
      flycam: string;
    }>;
  };
  message: string;
};

type RepairsRawData = {
  data: {
    total: number;
    page: number;
    repair_docs: Array<{
      id: number;
      docNo: string;
      dateRepair: string;
      route: {
        id: number;
        name: string;
        code: string;
      };
      routeCode: string;
      safeMeasure?: string;
      tasks: string;
      result?: string;
      unresolved?: string;
      status: 1 | 2 | 3 | 4 | 5;
      powers?: string;
      repairTeams: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7;
        lvSafe: 1 | 2 | 3 | 4 | 5;
        leader?: boolean;
      }>;
      repairApprovals: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        confirm?: boolean;
        represent: string;
      }>;
      repairImages: Array<{
        id: number;
        visualData: {
          id: number;
          path: string;
          image: string;
        };
      }>;
    }>;
  };
  message: string;
};

export default function Home() {
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [activeTab, setActiveTab] = useState("inspection");
  const [data, setData] = useState<ProfileData | null>();
  const [year, setYear] = useState(new Date().getFullYear());
  const [statisticYear, setStatisticYear] = useState<StatisticData | null>(
    null
  );
  const [inspects, setInspects] = useState<Array<InspectData>>([]);
  const [repairs, setRepairs] = useState<Array<RepairData>>([]);

  const [params, setParams] = useState({});
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  function fetchData() {
    fetchWithToken(SE.API_PROFILE)
      .then((response) => response as ProfileRawData)
      .then((data) => {
        if (!data.data) return;

        setData({
          id: data.data.user.id,
          username: data.data.user.username,
          displayName: data.data.user.name,
          phone: data.data.user.phone,
          email: data.data.user.email,
          gender: {
            1: Gender.Male,
            2: Gender.Female,
          }[data.data.user.gender],
          role: data.data.user.role.name,
          activity: data.data.user.activity,
          department: data.data.user.department,
          position: data.data.user.position,
          workLevel: data.data.user.lvWork,
          safeLevel: data.data.user.lvSafe,
          avatar: data.data.user.avatar,
          signature: data.data.user.signature,
        });
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(fetchData, []);

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
    if (year) {
      fetchDataByYear(year);
    }
  }, [year]);

  const renderPieChart = (data: StatisticData | null) => {
    if (!data) return null;

    const chartData = {
      labels: ["Phiếu kiểm tra", "Phiếu sửa chữa"],
      datasets: [
        {
          data: [data.times_inspect, data.times_repair],
          backgroundColor: ["#36A2EB", "#FF6384"],
          hoverBackgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    };

    return (
      <div className="flex">
        <div className="w-72 h-72">
          <Pie data={chartData} />
        </div>
      </div>
    );
  };

  function fetchDataInspect(params: any, limit: number, page: number) {
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(`${SE.API_INSPECTDOCS}?${new URLSearchParams(params)}`)
      .then((response) => response as InspectsRawData)
      .then((data) => {
        if (!data.data) return;

        setInspects(
          data.data.inspect_docs.map((inspectRawData) => ({
            id: inspectRawData.id,
            type: {
              D: InspectType.Day,
              N: InspectType.Night,
            }[inspectRawData.type],
            powerline: {
              id: inspectRawData.route.id,
              name: inspectRawData.route.name,
              code: inspectRawData.route.code,
            },
            powerPoles: {
              from: {
                id: inspectRawData.powerFi.id,
                name: inspectRawData.powerFi.name,
                code: inspectRawData.powerFi.code,
              },
              to: {
                id: inspectRawData.powerTi.id,
                name: inspectRawData.powerTi.name,
                code: inspectRawData.powerTi.code,
              },
            },
            code: inspectRawData.docNo,
            date: new Date(inspectRawData.dateInspect),
            inspectMethod: inspectRawData.methodInspect,
            approvers: inspectRawData.inspectApprovals.map((approverRaw) => ({
              id: approverRaw.id,
              username: approverRaw.username,
              name: approverRaw.name,
              position: approverRaw.position,
              signature: approverRaw.signature,
              represent: approverRaw.represent,
            })),
            workers: inspectRawData.inspectTeams.map((workerRaw) => ({
              id: workerRaw.id,
              username: workerRaw.username,
              name: workerRaw.name,
              position: workerRaw.position,
              lvWork: workerRaw.lvWork,
              lvSafe: workerRaw.lvSafe,
              signature: workerRaw.signature,
              leader: workerRaw.leader,
            })),
            workstations: inspectRawData.inspectWorkstations.map((iw) => ({
              id: iw.workstation.id,
              name: iw.workstation.name,
              code: iw.workstation.code,
              activity: iw.workstation.activity,
            })),
            flycams: inspectRawData.inspectFlycams.map((iu) => ({
              id: iu.flycam.id,
              name: iu.flycam.name,
              code: iu.flycam.code,
              activity: iu.flycam.activity,
            })),
            status: {
              1: InspectStatus.Created,
              2: InspectStatus.Confirmed,
              3: InspectStatus.Ready,
              4: InspectStatus.Submited,
              5: InspectStatus.Approved,
              6: InspectStatus.Completed,
            }[inspectRawData.status],
            images: inspectRawData.inspectImages.map(
              (imageRaw) => imageRaw.visualData.path
            ),
            warnings: inspectRawData.incidentFlies.map((warningRaw) => ({
              image: warningRaw.visualData.path,
              powerPole: warningRaw.power.name,
              latitude: warningRaw.latitude,
              longitude: warningRaw.longitude,
              altitude: warningRaw.altitude,
              description: warningRaw.incident,
            })),
            results: inspectRawData.inspectResults.map((resultRaw) => ({
              title: resultRaw.title,
              body: resultRaw.result,
              keyword: resultRaw.keyword,
            })),
          }))
        );

        setTotal(data.data.total);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (menubar("inspectdoc")) {
      setUserWright(UserWright.Write);
      fetchDataInspect(params, limit, currentPage);
    } else if (menubar("inspectdoc-view")) {
      setUserWright(UserWright.Read);
      fetchDataInspect(params, limit, currentPage);
    } else {
      setUserWright(UserWright.None);
    }
  }, [params, limit, currentPage]);

  function fetchDataRepair(params: any, limit: number, page: number) {
    params.limit = String(limit);
    params.page = String(page);
    fetchWithToken(`${SE.API_REPAIRDOCS}?${new URLSearchParams(params)}`)
      .then((response) => response as RepairsRawData)
      .then((data) => {
        if (!data.data) return;

        setRepairs(
          data.data.repair_docs.map((repairRawData) => ({
            id: repairRawData.id,
            code: repairRawData.docNo,
            powerline: {
              id: repairRawData.route.id,
              name: repairRawData.route.name,
              code: repairRawData.route.code,
            },
            date: new Date(repairRawData.dateRepair),
            prepare: repairRawData.safeMeasure,
            approvers: repairRawData.repairApprovals.map((approverRaw) => ({
              id: approverRaw.id,
              username: approverRaw.username,
              name: approverRaw.name,
              position: approverRaw.position,
              confirm: approverRaw.confirm,
              represent: approverRaw.represent,
            })),
            workers: repairRawData.repairTeams.map((workerRaw) => ({
              id: workerRaw.id,
              username: workerRaw.username,
              name: workerRaw.name,
              position: workerRaw.position,
              workLevel: workerRaw.lvWork,
              safeLevel: workerRaw.lvSafe,
            })),
            tasks: repairRawData.tasks,
            result: repairRawData.result,
            unresolved: repairRawData.unresolved,
            powers: repairRawData.powers ? repairRawData.powers.split(",") : [],
            status: {
              1: RepairStatus.Created,
              2: RepairStatus.Confirmed,
              3: RepairStatus.Submited,
              4: RepairStatus.Approved,
              5: RepairStatus.Completed,
            }[repairRawData.status],
            images: repairRawData.repairImages.map(
              (imageRaw) => imageRaw.visualData.path
            ),
          }))
        );

        setTotal(data.data.total);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    if (menubar("repairdoc")) {
      setUserWright(UserWright.Write);
      fetchDataRepair(params, limit, currentPage);
    } else if (menubar("repairdoc-view")) {
      setUserWright(UserWright.Read);
      fetchDataRepair(params, limit, currentPage);
    } else {
      setUserWright(UserWright.None);
    }
  }, [params, limit, currentPage]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
          Xin chào, {data?.displayName}
        </h2>
  
        <div className="gap-4 md:gap-6 mb-4 md:mb-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <CardTitle>Thống kê nổi bật năm {year}</CardTitle>
              <div className="flex mt-4 md:mt-0">
                <Button size="sm" className="mr-2">
                  <Link href={Nav.INSPECTDOC_DAY_PAGE} className="flex">
                    <Plus className="mr-2 h-4 w-4" /> Thêm phiếu kiểm tra
                  </Link>
                </Button>
                <Button size="sm" className="bg-gray-300 text-black">
                  <Link href={Nav.REPAIRDOC_NEW_PAGE} className="flex">
                    <Plus className="mr-2 h-4 w-4" /> Thêm phiếu sửa chữa
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row">
              {renderPieChart(statisticYear)}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ml-0 lg:ml-5 text-center">
                <StatCard title="Số lần kiểm tra" value={statisticYear?.times_inspect} />
                <StatCard title="Số lần sửa chữa" value={statisticYear?.times_repair} variant="blue" />
                <StatCard title="Số tuyến kiểm tra" value={statisticYear?.num_inspect_route} variant="purple" />
                <StatCard title="Số tuyến sửa chữa" value={statisticYear?.num_repair_route} variant="green" />
                <StatCard title="Số lỗi phát hiện khi bay" value={statisticYear?.num_incident_fly} />
                <StatCard title="Số lỗi camera phát hiện" value={statisticYear?.num_incident_cam} variant="blue" />
                <StatCard title="Tuyến gặp nhiều lỗi (phát hiện khi bay)" value={statisticYear?.route_max_incident_fly || "-"} variant="purple" />
                <StatCard title="Tuyến gặp nhiều lỗi (camera giám sát)" value={statisticYear?.route_max_incident_cam || "-"} variant="green" />
              </div>
            </CardContent>
          </Card>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>Các phiếu công việc gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="overflow-auto">
                <TabsTrigger value="inspection">Phiếu kiểm tra</TabsTrigger>
                <TabsTrigger value="repair">Phiếu sửa chữa</TabsTrigger>
              </TabsList>
              <TabsContent value="inspection">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="text-center">
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="hidden sm:table-cell text-center">Loại phiếu</TableHead>
                      <TableHead className="text-center">Ngày kiểm tra</TableHead>
                      <TableHead className="text-center">Mã phiếu</TableHead>
                      <TableHead className="hidden lg:table-cell text-center">Đội kiểm tra</TableHead>
                      <TableHead className="hidden sm:table-cell text-center">PTKT</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspects.slice(0, 5).map((inspect) => (
                      <TableRow key={inspect.id} className="text-center">
                        <TableCell className="font-medium">{inspect.id}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {inspect.type === InspectType.Day ? (
                            <div className="text-yellow-500">Phiếu ngày</div>
                          ) : (
                            <div className="text-blue-950">Phiếu đêm</div>
                          )}
                        </TableCell>
                        <TableCell>{Moment(inspect.date).format("DD-MM-YYYY")}</TableCell>
                        <TableCell>
                          <div className="font-bold pb-1">{inspect.code}</div>
                          <div className="text-xs">
                            <span className="text-tertiary">Tuyến: </span>
                            <span className="font-bold">{inspect.powerline.code}</span> ({inspect.powerline.name})
                          </div>
                          <div className="text-xs">
                            <span className="text-tertiary">Từ cột: </span>
                            <span className="font-bold">{inspect.powerPoles.from.code}</span>
                            <span className="text-tertiary"> đến </span>
                            <span className="font-bold">{inspect.powerPoles.to.code}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell w-[138px]">
                          {inspect.workers.map((worker, idx) => (
                            <div key={idx}>- {worker.name}</div>
                          ))}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{inspect.inspectMethod}</TableCell>
                        <TableCell>
                          <span className="flex justify-center font-bold">
                            {(() => {
                              switch (inspect.status) {
                                case InspectStatus.Created:
                                  return <div className="">Phiếu mới</div>;
                                case InspectStatus.Confirmed:
                                  return <div className="text-slate-500">Đã nhận phiếu</div>;
                                case InspectStatus.Ready:
                                  return <div className="text-orange-500">Thiết bị sẵn sàng</div>;
                                case InspectStatus.Submited:
                                  return <div className="text-neutral-500">Đã nộp phiếu</div>;
                                case InspectStatus.Approved:
                                  return <div className="text-fuchsia-500">Đang ký duyệt</div>;
                                case InspectStatus.Completed:
                                  return <div className="text-rose-500">Hoàn thành</div>;
                                default:
                                  return null;
                              }
                            })()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="repair">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="text-center">
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="text-center">Ngày sửa chữa</TableHead>
                      <TableHead className="text-center">Mã phiếu</TableHead>
                      <TableHead className="hidden lg:table-cell text-center">Đội sửa chữa</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repairs.slice(0, 5).map((repair) => (
                      <TableRow key={repair.id} className="text-center">
                        <TableCell className="font-medium">{repair.id}</TableCell>
                        <TableCell>{Moment(repair.date).format("DD-MM-YYYY")}</TableCell>
                        <TableCell>
                          <div className="font-bold pb-1">{repair.code}</div>
                          <div className="text-xs">
                            <span className="text-tertiary">Tuyến: </span>
                            <span className="font-bold">{repair.powerline.code}</span> ({repair.powerline.name})
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {repair.workers.map((worker, idx) => (
                            <div key={idx}>- {worker.name}</div>
                          ))}
                        </TableCell>
                        <TableCell>
                          <span className="flex justify-center font-bold">
                            {(() => {
                              switch (repair.status) {
                                case RepairStatus.Created:
                                  return <div className="">Phiếu mới</div>;
                                case RepairStatus.Confirmed:
                                  return <div className="text-slate-500">Đã nhận phiếu</div>;
                                case RepairStatus.Submited:
                                  return <div className="text-neutral-500">Đã nộp phiếu</div>;
                                case RepairStatus.Approved:
                                  return <div className="text-fuchsia-500">Đang ký duyệt</div>;
                                case RepairStatus.Completed:
                                  return <div className="text-rose-500">Hoàn thành</div>;
                                default:
                                  return null;
                              }
                            })()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
}

type StatCardProps = {
  title: string;
  value: number | undefined | string;
  variant?: "default" | "blue" | "purple" | "green";
};

function StatCard({ title, value, variant = "default" }: StatCardProps) {
  const bgColor = {
    default: "bg-card",
    blue: "bg-blue-100",
    purple: "bg-purple-100",
    green: "bg-green-100"
  }[variant]

  return (
    <Card className={`${bgColor} w-full`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-center">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  )
}
