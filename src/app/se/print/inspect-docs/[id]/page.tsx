"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Moment from "moment";
import Image from "next/image";
import menubar from "@/lib/menu";
import { UserWright } from "@/enum/user_wright";
import { InspectStatus } from "@/enum/doc_status";
import { InspectType } from "@/enum/inspect_type";
import { InspectData } from "@/app/se/(auth)/(menu)/inspect-docs/inspect_data";
import { fetchInspectData } from "@/app/se/(auth)/(menu)/inspect-docs/fetch_inspect_data";
import UserDontAccessPage from "@/component/NotAllow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Component({ params }: { params: { id: string } }) {
  const [userWright, setUserWright] = useState<UserWright | null>(null);
  const [data, setData] = useState<InspectData | null>();

  interface Keywords {
    [key: string]: string;
  }

  const keywordsDay: Keywords = {
    corridor:
      "Hành lang tuyến: (ghi các tồn tại trong hành lang tuyến, ngoài hành lang tuyến có khả năng gây sự cố.v.v. và các nội dung cần xử lý)",
    steel_col:
      "Cột: (ghi các vị trí cột nghiêng, biến dạng, nứt, mất thanh giằng, biển báo... và các nội dung cần xử lý)",
    col_foundation:
      "Móng cột: (ghi các vị trí lún, nứt, xói lở và có tình trạng bất thường, các khu vực xung quanh móng cột... các nội dung cần xử lý)",
    structure:
      "Các kết cấu xà và giá đỡ: (ghi các vị trí cần xử lý - nội dung cần xử lý)",
    insulate:
      "Sứ cách điện: (ghi các tồn tại như vỡ, nứt, phóng điện, bụi bẩn, phụ kiện chuỗi sứ, các hiện tượng bất thường khác và nội dung cần xử lý)",
    electric_wire:
      "Dây dẫn: (ghi các vị trí dây bị tổn thương, đứt sợi, vặn xoắn, quấn táp, vật lạ bám vào đường dây, độ võng, các hiện tượng bất thường của mối nối và các nội dung cần xử lý)",
    earthing: "Các kết cấu tiếp địa, tình trạng tiếp địa",
    holding_rope: "Dây néo, móng néo:",
    anti_lightning: "Các thiết bị chống sét:",
    anti_vibration: "Tạ bù - Tạ chống rung:",
    heat_coupling: "Phát nhiệt mối nối",
  };

  const keywordsDay2: Keywords = {
    processed: "2. Các tồn tại đã xử lý ngay trong kiểm tra",
    suggest:
      "3. Các kiến nghị sau kiểm tra : (phần này do Tổ trưởng vận hành ghi)",
  };

  const keywordsNight: Keywords = {
    heat_coupling: "Hiện tượng phát nhiệt các mối nối:",
    discharge: "Hiện tượng phóng điện ở đường dây, chuỗi cách điện:",
  };

  const keywordsNight2: Keywords = {
    other: "2. Các hiện tượng bất thường khác:",
    suggest:
      "3. Các kiến nghị sau kiểm tra : (phần này do Tổ trưởng vận hành ghi)",
  };

  useEffect(() => {
    if (menubar("inspectdoc")) {
      setUserWright(UserWright.Write);
    } else if (menubar("inspectdoc-view")) {
      setUserWright(UserWright.Read);
    } else {
      setUserWright(UserWright.None);
    }

    const id = Number(params.id) || 0;
    fetchInspectData(id)
      .then((response) => setData(response))
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }, [params]);

  if (!userWright) return null;
  if (userWright === UserWright.None) return <UserDontAccessPage />;
  if (!data) return null;

  const DottedLines = () => (
    <div className="mt-4">
      <div className="border-b border-dotted border-gray-400 my-2 mt-8"></div>
      <div className="border-b border-dotted border-gray-400 my-2 mt-8"></div>
      <div className="border-b border-dotted border-gray-400 my-2 mt-8"></div>
    </div>
  );

  return (
    <div>
      <div className="max-w-4xl mx-auto bg-white rounded-lg font-times text-base print-content">
        <div className="flex justify-between mb-6 leading-tight">
          <div className="text-center">
            <div>TỔNG CÔNG TY</div>
            <div>ĐIỆN LỰC TP HÀ NỘI</div>
            <div className="font-bold">CÔNG TY LƯỚI ĐIỆN</div>
            <div className="font-bold">CAO THẾ HÀ NỘI</div>
            <div className="font-bold underline underline-offset-4">
              Đội đường dây
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div className="text-center font-bold underline underline-offset-4">
              Độc lập - Tự do - Hạnh phúc
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="font-bold">
            PHIẾU KIỂM TRA{" "}
            {
              {
                [InspectType.Day]: "NGÀY",
                [InspectType.Night]: "ĐÊM",
              }[data.type]
            }{" "}
            ĐƯỜNG DÂY CAO THẾ
          </div>
        </div>

        <div className="mb-4">
          <div>Mã phiếu: {data.code}</div>
          <div className="mr-10">
            Ngày kiểm tra: {Moment(data.date).format("DD-MM-YYYY")}
          </div>
          <div>
            {" "}
            Tên tuyến đường dây: {data.powerline.name} ({data.powerline.code})
          </div>
          <div>Phương thức kiểm tra: {data.inspectMethod}</div>
          <div>
            {" "}
            Đoạn đường dây kiểm tra: Từ {data.powerPoles.from.name} (
            {data.powerPoles.from.code}) đến {data.powerPoles.to.name} (
            {data.powerPoles.to.code})
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">
            Danh sách nhóm kiểm tra:
          </h3>
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
                  <TableCell>{worker.lvWork}</TableCell>
                  <TableCell>{worker.lvSafe}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-lg mb-2">1. Nội dung kiểm tra:</h3>
          {data.type == InspectType.Day &&
            data.results
              .filter((rs) => keywordsDay[rs.keyword] != undefined)
              .map((result) => (
                <div key={result.keyword} className="mb-4">
                  <p className="font-medium">- {keywordsDay[result.keyword]}</p>
                  {result.body ? (
                    <div className="ml-4 mt-2 text-sm">
                      {result.body.split("Vị trí cột").map((line, index) => (
                        <p key={index} className="mb-1">
                          {index > 0 && (
                            <span className="font-semibold">Vị trí cột </span>
                          )}
                          <span className="ml-2">{line.trim()}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <DottedLines />
                    </div>
                  )}
                  <DottedLines />
                </div>
              ))}
          {data.type == InspectType.Night &&
            data.results
              .filter((rs) => keywordsNight[rs.keyword] != undefined)
              .map((result) => (
                <div key={result.keyword} className="mb-4">
                  <p className="font-medium">
                    - {keywordsNight[result.keyword]}
                  </p>
                  {result.body ? (
                    <div className="ml-4 mt-2 text-sm">
                      {result.body.split("Vị trí cột").map((line, index) => (
                        <p key={index} className="mb-1">
                          {index > 0 && (
                            <span className="font-semibold">Vị trí cột </span>
                          )}
                          <span className="ml-2">{line.trim()}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <DottedLines />
                    </div>
                  )}
                  <DottedLines />
                </div>
              ))}
        </div>

        <Separator />

        <div>
          {data.type == InspectType.Day &&
            data.results
              .filter((rs) => keywordsDay2[rs.keyword] != undefined)
              .map((result2) => (
                <div key={result2.keyword} className="mt-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {keywordsDay2[result2.keyword]}
                  </h3>
                  {result2.body ? (
                    <p className="ml-4 text-sm">{result2.body}</p>
                  ) : (
                    <DottedLines />
                  )}
                  <DottedLines />
                </div>
              ))}
          {data.type == InspectType.Night &&
            data.results
              .filter((rs) => keywordsNight2[rs.keyword] != undefined)
              .map((result2) => (
                <div key={result2.keyword} className="mt-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {keywordsNight2[result2.keyword]}
                  </h3>
                  {result2.body ? (
                    <p className="ml-4 text-sm">{result2.body}</p>
                  ) : (
                    <div className="ml-4">
                      <DottedLines />
                    </div>
                  )}
                  <DottedLines />
                </div>
              ))}
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
                    <div className="h-20"></div>
                  )}
                  <p className="mt-2 text-sm">{approver.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="font-semibold mb-2">Nhóm kiểm tra</p>
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
                    <div className="h-20"></div>
                  )}
                  <p className="mt-2 text-sm">{worker.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
