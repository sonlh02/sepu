"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import DatePicker from "react-datepicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

interface NewWorkstationModalProps {
  className?: string;
  setIsNewModalShow: Dispatch<SetStateAction<boolean>>;
  fetchData: (params: any, limit: number, currentPage: number) => void;
  params: any;
  limit: number;
  currentPage: number;
}

export default function NewWorkstationModal({
  className,
  setIsNewModalShow,
  fetchData,
  params,
  limit,
  currentPage,
}: NewWorkstationModalProps) {
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    new Date()
  );

  async function create(formData: FormData) {
    const name = formData.get("name")?.toString() || "";
    const code = formData.get("code")?.toString() || "";
    const wsCode = formData.get("wsCode")?.toString() || "";
    const wssKey = formData.get("wssKey")?.toString() || "";
    const activity = formData.get("activity") === "on";
    const note = formData.get("note")?.toString() || "";

    try {
      const data = await fetchWithToken(SE.API_WORKSTATION, {
        method: "POST",
        body: JSON.stringify({
          name,
          code,
          date_buy: purchaseDate?.toISOString(),
          wscode: wsCode,
          wsskey: wssKey,
          activity,
          note,
        }),
      });

      if (data.message) toast.success(data.message);

      setIsNewModalShow(false);
      fetchData(params, limit, currentPage);
    } catch (e) {
      if (e instanceof Error && e.message) toast.error(e.message);
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => setIsNewModalShow(false)}>
      <DialogContent className={`sm:max-w-[425px] ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Thêm máy trạm
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create(new FormData(e.currentTarget));
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên thiết bị <span className="text-destructive">*</span>
              </Label>
              <Input id="name" name="name" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">
                Mã code <span className="text-destructive">*</span>
              </Label>
              <Input id="code" name="code" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="purchaseDate">Ngày mua</Label>
              <DatePicker
                name="purchaseDate"
                id="purchaseDate"
                className="input input-bordered w-full py-3 px-4 text-sm border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                dateFormat="dd/MM/yyyy"
                selected={purchaseDate}
                onChange={(date) => date && setPurchaseDate(date)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wsCode">
                wscode <span className="text-destructive">*</span>
              </Label>
              <Input id="wsCode" name="wsCode" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wssKey">
                wsskey <span className="text-destructive">*</span>
              </Label>
              <Input id="wssKey" name="wssKey" required />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="activity" name="activity" defaultChecked />
              <Label htmlFor="activity">Hoạt động</Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea id="note" name="note" />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewModalShow(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Thêm</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
