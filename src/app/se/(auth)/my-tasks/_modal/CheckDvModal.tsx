"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { InspectType } from "@/enum/inspect_type";
import { InspectData, PagingDoc } from "../doc_data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Monitor, DrumIcon } from "lucide-react";

export default function CheckDvInspectModal({
  className,
  inspectData,
  setAction,
  fetchData,
  currentPage,
}: {
  className?: string;
  inspectData: InspectData;
  setAction: Dispatch<SetStateAction<string>>;
  fetchData: Function;
  currentPage: PagingDoc;
}) {
  const [wsItem, setWsItem] = useState<
    Record<string, { status: boolean; note: string }>
  >({});
  const [uavItem, setUavItem] = useState<
    Record<string, { status: boolean; note: string }>
  >({});

  function check() {
    fetchWithToken(SE.API_WORKINSPECTCHECKDV, {
      method: "POST",
      body: JSON.stringify({
        doc_id: inspectData.id,
        workstation: wsItem,
        flycam: uavItem,
      }),
    })
      .then((data) => {
        if (data.message) toast.success(data.message);
        setAction("");
        fetchData(currentPage);
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  const renderEquipmentCard = (
    equipment: any,
    type: "workstation" | "flycam"
  ) => (
    <Card key={equipment.id} className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          {type === "workstation" ? (
            <Monitor className="mr-2 h-5 w-5" />
          ) : (
            <DrumIcon className="mr-2 h-5 w-5" />
          )}
          {equipment.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          onValueChange={(value) => {
            const setter = type === "workstation" ? setWsItem : setUavItem;
            setter((prev) => ({
              ...prev,
              [equipment.id]: {
                ...prev[equipment.id],
                status: value === "normal",
              },
            }));
          }}
          value={
            type === "workstation"
              ? wsItem[equipment.id]?.status
                ? "normal"
                : "abnormal"
              : uavItem[equipment.id]?.status
              ? "normal"
              : "abnormal"
          }
          className="mb-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="normal"
              id={`${type}-normal-${equipment.id}`}
            />
            <Label htmlFor={`${type}-normal-${equipment.id}`}>
              Bình thường
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="abnormal"
              id={`${type}-abnormal-${equipment.id}`}
            />
            <Label htmlFor={`${type}-abnormal-${equipment.id}`}>
              Gặp bất thường
            </Label>
          </div>
        </RadioGroup>
        <Textarea
          placeholder="Ghi chú"
          onChange={(event) => {
            const setter = type === "workstation" ? setWsItem : setUavItem;
            setter((prev) => ({
              ...prev,
              [equipment.id]: {
                ...prev[equipment.id],
                note: event.target.value,
              },
            }));
          }}
          className="min-h-[100px]"
        />
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={true} onOpenChange={() => setAction("")}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Phiếu{" "}
            <span className="break-all font-mono">{inspectData.code}</span>
          </DialogTitle>
          <Badge
            variant={
              inspectData.type === InspectType.Day ? "outline" : "secondary"
            }
            className="mx-auto text-lg py-1 px-3"
          >
            {inspectData.type === InspectType.Day
              ? "Phiếu kiểm tra ngày"
              : "Phiếu kiểm tra đêm"}
          </Badge>
        </DialogHeader>

        <Tabs defaultValue="workstation" className="flex-grow">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="workstation"
              disabled={inspectData.workstations.length === 0}
            >
              <Monitor className="mr-2 h-5 w-5" />
              Máy trạm ({inspectData.workstations.length})
            </TabsTrigger>
            <TabsTrigger
              value="flycam"
              disabled={inspectData.flycams.length === 0}
            >
              <DrumIcon className="mr-2 h-5 w-5" />
              UAV ({inspectData.flycams.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex-grow">
            <ScrollArea className="h-full">
              <TabsContent value="workstation" className="mt-0 h-full">
                {inspectData.workstations.map((ws) =>
                  renderEquipmentCard(ws, "workstation")
                )}
              </TabsContent>
              <TabsContent value="flycam" className="mt-0 h-full">
                {inspectData.flycams.map((flycam) =>
                  renderEquipmentCard(flycam, "flycam")
                )}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setAction("")}>
            Hủy
          </Button>
          <Button className="bg-green-500 text-white" onClick={check}>
            {inspectData.workstations.length === 0 &&
            inspectData.flycams.length === 0
              ? "Không có thiết bị đính kèm"
              : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
