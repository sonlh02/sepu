"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { CalendarIcon, Plane, X } from "lucide-react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { DeviceData } from "./page";

export default function EditUavModal({
  className,
  data,
  setEditingData,
  fetchData,
  params,
  limit,
  currentPage,
}: {
  className?: string;
  data: DeviceData;
  setEditingData: Dispatch<SetStateAction<DeviceData | null>>;
  fetchData: Function;
  params: any;
  limit: number;
  currentPage: number;
}) {
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    new Date(data.purchaseDate)
  );
  const [isActive, setIsActive] = useState(data.activity);

  function edit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString() || "";
    const code = formData.get("code")?.toString() || "";
    const note = formData.get("note")?.toString() || "";

    fetchWithToken(`${SE.API_FLYCAM}/${data.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: name,
        code: code,
        date_buy: purchaseDate?.toISOString(),
        activity: isActive,
        note: note,
      }),
    })
      .then((data) => {
        if (data.message) toast.success(data.message);
        setEditingData(null);
        fetchData(params, limit, currentPage);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  return (
    <Dialog open={true} onOpenChange={() => setEditingData(null)}>
      <DialogContent className={`sm:max-w-[500px] ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold flex items-center justify-center gap-2">
            <Plane className="h-6 w-6" />
            Sửa thiết bị bay
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={edit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">
                    Tên thiết bị <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={data.name}
                    required
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-base">
                    Mã code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    defaultValue={data.code}
                    required
                    className="text-base"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="purchaseDate" className="text-base">
                    Ngày mua
                  </Label>
                  <DatePicker
                    name="purchaseDate"
                    id="purchaseDate"
                    className="input input-bordered w-full py-3 px-4 text-sm border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    dateFormat="dd/MM/yyyy"
                    selected={purchaseDate}
                    onChange={(date) => date && setPurchaseDate(date)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="activity" className="text-base">
                    Trạng thái hoạt động
                  </Label>
                  <Switch
                    id="activity"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-base">
                    Ghi chú
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    defaultValue={data.note}
                    className="text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full text-base">
            Cập nhật
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
