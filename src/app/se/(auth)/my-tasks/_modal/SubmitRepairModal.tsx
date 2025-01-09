"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { RepairData, PagingDoc } from "../doc_data";
import { VStep1 } from "./_step_repair/Step1";
import { NStep2 } from "./_step_repair/Step2";

export default function ConfirmRepairModal({
  setAction,
  repairData,
  fetchData,
  currentPage,
}: {
  setAction: Dispatch<SetStateAction<string>>;
  repairData: RepairData;
  fetchData: Function;
  currentPage: PagingDoc;
}) {
  const [images, setImages] = useState<Array<File>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [selectedPowers, setSelectedPowers] = useState<
    Array<{ value: string; label: string }>
  >([]);

  function submit(formData: FormData) {
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

    if (formData.get("result"))
      submitFormData.append("result", formData.get("result") as string);

    if (formData.get("unresolved"))
      submitFormData.append("unresolved", formData.get("unresolved") as string);

    // Log the FormData entries
    const formDataArray = Array.from(submitFormData.entries());
    for (const [key, value] of formDataArray) {
      console.log(key, value);
    }

    fetchWithToken(SE.API_WORKREPAIRSUBMIT, {
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
    if (currentStep < 1) return setDisableSubmit(true);
    new Promise((resolve) => setTimeout(resolve, 10)).then(() =>
      setDisableSubmit(false)
    );
  }, [currentStep]);

  return (
    <Dialog open={true} onOpenChange={() => setAction("")}>
      <DialogContent className="max-w-5xl">
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

        <div className="flex justify-center py-6">
          <div className="flex space-x-4">
            <Badge variant={currentStep >= 0 ? "default" : "outline"}>
              Thông tin
            </Badge>
            <Badge variant={currentStep >= 1 ? "default" : "outline"}>
              Báo cáo
            </Badge>
          </div>
        </div>

        <div className="h-[calc(100dvh-20rem)] overflow-y-auto">
          {currentStep === 0 && (
            <VStep1
              // className="sm:grid-cols-2"
              repairData={repairData}
            />
          )}

          {currentStep === 1 && (
            <NStep2
              id="finalStep"
              repairData={repairData}
              images={images}
              setImages={setImages}
              action={submit}
              selectedPowers={selectedPowers}
              setSelectedPowers={setSelectedPowers}
            />
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
            disabled={currentStep <= 0}
          >
            Quay lại
          </Button>
          {currentStep < 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Bước tiếp theo
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-purple-500"
              form="finalStep"
              disabled={disableSubmit}
            >
              Nộp phiếu
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
