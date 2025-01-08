"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plane,
  Hash,
  FileText,
  Activity,
} from "lucide-react";
import DatePicker from "react-datepicker";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NewUavModal({
  className,
  setIsNewModalShow,
  fetchData,
  params,
  limit,
  currentPage,
}: {
  className?: string;
  setIsNewModalShow: Dispatch<SetStateAction<boolean>>;
  fetchData: (params: any, limit: number, currentPage: number) => void;
  params: any;
  limit: number;
  currentPage: number;
}) {
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    new Date()
  );
  const [isActive, setIsActive] = useState(true);

  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString() || "";
    const code = formData.get("code")?.toString() || "";
    const note = formData.get("note")?.toString() || "";

    fetchWithToken(SE.API_FLYCAM, {
      method: "POST",
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
        setIsNewModalShow(false);
        fetchData(params, limit, currentPage);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  return (
    <Dialog open={true} onOpenChange={() => setIsNewModalShow(false)}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent pb-2">
            Thêm Thiết Bị Bay Mới
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={create} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Tên thiết bị <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Plane
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="name"
                  name="name"
                  required
                  className="pl-10"
                  placeholder="Nhập tên thiết bị"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Mã code <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="code"
                  name="code"
                  required
                  className="pl-10"
                  placeholder="Nhập mã code"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Ngày mua</Label>
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
            <Label
              htmlFor="activity"
              className="text-sm font-medium flex items-center"
            >
              <Activity className="mr-2 text-gray-400" size={18} />
              Trạng thái hoạt động
            </Label>
            <Switch
              id="activity"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Ghi chú
            </Label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <Textarea
                id="note"
                name="note"
                className="pl-10"
                placeholder="Nhập ghi chú (nếu có)"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-black to-gray-600 hover:from-black hover:to-gray-700 text-white"
          >
            Thêm Thiết Bị
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
