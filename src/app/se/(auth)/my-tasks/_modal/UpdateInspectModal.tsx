"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { InspectType } from "@/enum/inspect_type";
import {
  InspectData,
  WarningData,
  IncidentData,
  ImageData,
  PagingDoc,
} from "../doc_data";
import { VStep1 } from "./_step_inspect/Step1";
import { VStep2, NStep2 } from "./_step_inspect/Step2";
import { NStep3 } from "./_step_inspect/Step3";
import { ViewImage, ViewIncidentImage } from "./_modal2/ViewImage";
import { ImageDeletionDialog } from "./_modal2/DeleteImage";
import { DeleteIncident } from "./_modal2/DeleteIncident";

export default function UpdateInspectModal({
  inspectData,
  setAction,
  fetchData,
  currentPage,
}: {
  inspectData: InspectData;
  setAction: React.Dispatch<React.SetStateAction<string>>;
  fetchData: Function;
  currentPage: PagingDoc;
}) {
  const [images, setImages] = useState<Array<File>>([]);
  const [warnings, setWarnings] = useState<Array<WarningData>>([
    {
      id: Math.random(),
      powerPole: undefined,
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      image: undefined,
      object: undefined,
      description: undefined,
    },
  ]);

  const [act, setAct] = useState<string>("");
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [incident, setIncident] = useState<IncidentData | null>(null);

  const [currentStep, setCurrentStep] = useState("info");
  const [disableSubmit, setDisableSubmit] = useState(true);

  function update(formData: FormData) {
    const submitFormData = new FormData();

    submitFormData.append("doc_id", String(inspectData.id));
    images.forEach((img) => {
      submitFormData.append("images", img);
    });

    if (
      warnings.length > 1 ||
      (warnings.length === 1 && warnings[0].powerPole && warnings[0].image)
    ) {
      submitFormData.append(
        "incident",
        JSON.stringify(
          warnings.map((warning) => ({
            power_id: warning.powerPole,
            latitude: warning.latitude,
            longitude: warning.longitude,
            altitude: warning.altitude,
            image: warning.image,
            incident_type: warning.object,
            incident: warning.description,
          }))
        )
      );
    }

    submitFormData.append(
      "result",
      JSON.stringify(
        inspectData.type === InspectType.Night
          ? {
              heat_coupling: formData.get("1_1")?.toString() || "",
              discharge: formData.get("1_2")?.toString() || "",
              other: formData.get("2")?.toString() || "",
              suggest: formData.get("3")?.toString() || "",
            }
          : {
              corridor: formData.get("1_1")?.toString() || "",
              steel_col: formData.get("1_2")?.toString() || "",
              col_foundation: formData.get("1_3")?.toString() || "",
              structure: formData.get("1_4")?.toString() || "",
              insulate: formData.get("1_5")?.toString() || "",
              electric_wire: formData.get("1_6")?.toString() || "",
              earthing: formData.get("1_7")?.toString() || "",
              holding_rope: formData.get("1_8")?.toString() || "",
              anti_lightning: formData.get("1_9")?.toString() || "",
              anti_vibration: formData.get("1_10")?.toString() || "",
              heat_coupling: formData.get("1_11")?.toString() || "",
              processed: formData.get("2")?.toString() || "",
              suggest: formData.get("3")?.toString() || "",
            }
      )
    );

    fetchWithToken(SE.API_WORKINSPECTUPDATE, {
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
    if (currentStep !== "report") return setDisableSubmit(true);
    new Promise((resolve) => setTimeout(resolve, 10)).then(() =>
      setDisableSubmit(false)
    );
  }, [currentStep]);

  return (
    <>
      <Dialog open={true} onOpenChange={() => setAction("")}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Badge
                variant={
                  inspectData.type === InspectType.Day ? "outline" : "secondary"
                }
                className="mb-2"
              >
                {inspectData.type === InspectType.Day
                  ? "Phiếu kiểm tra ngày"
                  : "Phiếu kiểm tra đêm"}
              </Badge>
              <div>
                Phiếu{" "}
                <span className="break-all font-mono">{inspectData.code}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={currentStep}
            onValueChange={setCurrentStep}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="uploaded">Dữ liệu đã upload</TabsTrigger>
              <TabsTrigger value="abnormal">Bất thường</TabsTrigger>
              <TabsTrigger value="report">Báo cáo</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="overflow-y-auto">
              <VStep1 inspectData={inspectData} />
            </TabsContent>
            <TabsContent value="uploaded" className="overflow-y-auto">
              <VStep2
                inspectData={inspectData}
                setImageData={setImageData}
                setIncident={setIncident}
                setAct={setAct}
                del={true}
              />
            </TabsContent>
            <TabsContent value="abnormal" className="overflow-y-auto">
              <NStep2
                inspectData={inspectData}
                images={images}
                setImages={setImages}
                warnings={warnings}
                setWarnings={setWarnings}
              />
            </TabsContent>
            <TabsContent value="report" className="overflow-y-auto">
              <NStep3
                id="finalStep"
                inspectData={inspectData}
                action={update}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="sticky bottom-0 bg-white pt-4">
            <Button
              variant="outline"
              onClick={() => {
                const steps = ["info", "uploaded", "abnormal", "report"];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1]);
                }
              }}
              disabled={currentStep === "info"}
            >
              Quay lại
            </Button>
            {currentStep !== "report" ? (
              <Button
                onClick={() => {
                  const steps = ["info", "uploaded", "abnormal", "report"];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1]);
                  }
                }}
              >
                Bước tiếp theo
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-yellow-500 text-white"
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
          data={inspectData}
          imageData={imageData}
          setImageData={setImageData}
          setAct={setAct}
          fetchData={fetchData}
          currentPage={currentPage}
          type={inspectData ? "inspect" : "repair"}
        />
      )}

      {act === "img-incident" && incident && (
        <ViewIncidentImage
          incident={incident}
          setIncident={setIncident}
          setAct={setAct}
        />
      )}

      {act === "incident-delete" && incident && (
        <DeleteIncident
          inspectData={inspectData}
          incident={incident}
          setIncident={setIncident}
          setAct={setAct}
          fetchData={fetchData}
          currentPage={currentPage}
        />
      )}
    </>
  );
}
