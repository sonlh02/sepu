import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { RepairData, ImageData, PagingDoc } from "../doc_data";
import { VStep1 } from "./_step_repair/Step1";
import { VStep2, NStep2 } from "./_step_repair/Step2";
import { ViewImage } from "./_modal2/ViewImage";
import { ImageDeletionDialog } from "./_modal2/DeleteImage";
import { DeleteIncident } from "./_modal2/DeleteIncident";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UpdateRepairModal({
  repairData,
  fetchData,
  currentPage,
  setAction,
}: {
  repairData: RepairData;
  fetchData: Function;
  currentPage: PagingDoc;
  setAction: Dispatch<SetStateAction<string>>;
}) {
  const [images, setImages] = useState<Array<File>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [act, setAct] = useState<string>("");
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [selectedPowers, setSelectedPowers] = useState<
    Array<{ value: string; label: string }>
  >([]);

  function update(formData: FormData) {
    const submitFormData = new FormData();

    submitFormData.append("repair_doc_id", String(repairData.id));
    images.forEach((img) => {
      submitFormData.append("images", img);
    });

    if (selectedPowers.length > 0) {
      submitFormData.append(
        "powers",
        selectedPowers.map((pw) => pw.value).join(",")
      );
    }

    if (formData?.get("result"))
      submitFormData.append("result", formData.get("result") as string);

    if (formData?.get("unresolved"))
      submitFormData.append("unresolved", formData.get("unresolved") as string);

    fetchWithToken(SE.API_WORKREPAIRUPDATE, {
      method: "POST",
      headers: { "Content-Type": null },
      body: submitFormData,
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

  useEffect(() => {
    if (currentStep < 2) return setDisableSubmit(true);
    new Promise((resolve) => setTimeout(resolve, 10)).then((_) =>
      setDisableSubmit(false)
    );
  }, [currentStep]);

  return (
    <>
      <Dialog open={true} onOpenChange={() => setAction("")}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Badge variant="outline" className="mb-2">
                Phiếu sửa chữa
              </Badge>
              <div className="text-2xl font-bold">
                Phiếu{" "}
                <span className="break-all font-mono">{repairData.code}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={`step-${currentStep}`}
            onValueChange={(value) =>
              setCurrentStep(Number(value.split("-")[1]))
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="step-0">Thông tin</TabsTrigger>
              <TabsTrigger value="step-1">Dữ liệu đã upload</TabsTrigger>
              <TabsTrigger value="step-2">Báo cáo</TabsTrigger>
            </TabsList>
            <TabsContent value="step-0" className="overflow-y-auto">
              <VStep1 repairData={repairData} />
            </TabsContent>
            <TabsContent value="step-1" className="overflow-y-auto">
              <VStep2
                repairData={repairData}
                setImageData={setImageData}
                setAct={setAct}
                del={true}
              />
            </TabsContent>
            <TabsContent value="step-2" className="overflow-y-auto">
              <NStep2
                id="finalStep"
                repairData={repairData}
                images={images}
                setImages={setImages}
                selectedPowers={selectedPowers}
                setSelectedPowers={setSelectedPowers}
                action={update}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="sticky bottom-0 bg-white pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
              disabled={currentStep <= 0}
            >
              Quay lại
            </Button>
            {currentStep < 2 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Bước tiếp theo
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-yellow-500"
                form="finalStep"
                disabled={disableSubmit}
              >
                Chỉnh sửa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {act === "img-view" && imageData && (
        <ViewImage
          imageData={imageData}
          setImageData={setImageData}
          setAct={setAct}
          del={true}
        />
      )}

      {act === "img-delete" && imageData && (
        <ImageDeletionDialog
          data={repairData}
          imageData={imageData}
          setImageData={setImageData}
          setAct={setAct}
          fetchData={fetchData}
          currentPage={currentPage}
          type={repairData ? "inspect" : "repair"}
        />
      )}
    </>
  );
}
