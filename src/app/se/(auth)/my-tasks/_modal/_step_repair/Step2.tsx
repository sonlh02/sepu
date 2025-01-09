import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import { RepairData, ImageData } from "../../doc_data";
import Select, { MultiValue } from "react-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type ReferenceRawData = {
  data: {
    powers: {
      [key: string]: {
        id: number;
        code: string;
        name: string;
        latitude: number;
        longitude: number;
      };
    };
    power_items: {
      [key: string]: string;
    };
  };
};

export type ReferenceData = {
  powerPoles: Array<{
    code: string;
    id: string;
  }>;
  objects: Array<{
    code: string;
    id: string;
  }>;
};

export function NStep2({
  id,
  className,
  repairData,
  images,
  setImages,
  selectedPowers,
  setSelectedPowers,
  action,
}: {
  id: string;
  className?: string;
  repairData: RepairData;
  images: Array<File>;
  setImages: Dispatch<SetStateAction<Array<File>>>;
  selectedPowers: Array<{ value: string; label: string }>;
  setSelectedPowers: Dispatch<SetStateAction<Array<{ value: string; label: string }>>>;
  action?: (formData: FormData) => void;
}) {
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);

  function fetchReferenceData(repairData: RepairData) {
    fetchWithToken(
      `${SE.API_WORKPOWER}?${new URLSearchParams({
        doc_id: String(repairData.id),
        type: "repair",
      })}`
    )
      .then((response) => response as ReferenceRawData)
      .then((data) => {
        if (!data.data) return;

        setReferenceData({
          powerPoles: Object.entries(data.data.powers).map(([powerPolesId, powerPolesData]) => ({
            id: powerPolesId,
            code: powerPolesData.code,
          })),
          objects: Object.entries(data.data.power_items).map(([objectsId, objectsCode]) => ({
            id: objectsId,
            code: objectsCode,
          })),
        });
      })
      .catch((e: Error) => {
        console.error(e.message);
      });
  }

  useEffect(() => {
    fetchReferenceData(repairData);
  }, [repairData]);

  // Handle power change
  const handlePowersChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    setSelectedPowers(newValue as Array<{ value: string; label: string }>);
  };

  // Convert repairData.powers string into options
  const powersString = repairData.powers || "";
  const powerCodes = powersString.split(",").filter((code) => code.trim() !== "");
  const powerOptions = powerCodes.map((code) => ({
    value: code,
    label: code,
  }));

  return (
    <form id={id} className={`form-control ${className || ""}`} action={action}>
      {/* Image Upload Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">Hình ảnh kiểm tra</label>
          <Button className="relative">
            Thêm ảnh
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              multiple
              accept="image/*"
              onChange={(event) => {
                if (!event.target.files) return;
                const files = Array.from(event.target.files);
                setImages((prev) => [...prev, ...files]);
                event.target.value = "";
              }}
            />
          </Button>
        </div>

        <div className="flex space-x-4 overflow-x-auto rounded-lg bg-gray-100 p-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Image
                src={URL.createObjectURL(image)}
                alt="upload"
                width={100}
                height={100}
                className="object-cover rounded-md"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-0 right-0 hidden group-hover:block"
                onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
              >
                Xóa
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Repair Result Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium">Kết quả sửa chữa</label>
        <Textarea name="result" defaultValue={repairData.result} />

        <label className="block text-sm font-medium">Vấn đề còn tồn tại</label>
        <Textarea defaultValue={repairData.unresolved} />
      </div>

      {/* Power Poles Selection Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium">Các cột đã sửa chữa</label>
        <Select
          isMulti
          options={referenceData?.powerPoles.map((pole) => ({
            value: pole.code,
            label: pole.code,
          }))}
          defaultValue={powerOptions}
          onChange={handlePowersChange}
        />
      </div>
    </form>
  );
}

export function VStep2({
  className,
  repairData,
  setImageData,
  setAct,
  del,
}: {
  className?: string;
  repairData: RepairData;
  setImageData: Dispatch<SetStateAction<ImageData | null>>;
  setAct: Dispatch<SetStateAction<string>>;
  del?: boolean;
}) {
  return (
    <div className={`form-control ${className || ""}`}>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Hình ảnh kiểm tra</label>
        <div className="flex space-x-4 overflow-x-auto rounded-lg bg-gray-100 p-4">
          {repairData.images.map((image, index) => (
            <div key={index} className="relative group">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/${image.path}`}
                alt="view"
                width={100}
                height={100}
                className="object-cover rounded-md"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-0 right-0 hidden group-hover:block"
                onClick={() => {
                  setAct("img-view");
                  setImageData(image);
                }}
              >
                Xem
              </Button>

              {del && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-0 right-0 hidden group-hover:block"
                  onClick={() => {
                    setAct("img-delete");
                    setImageData(image);
                  }}
                >
                  Xóa
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {!del && (
        <>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Kết quả sửa chữa</label>
            <div className="border p-2 rounded-md">{repairData.result}</div>

            <label className="block text-sm font-medium">Vấn đề còn tồn tại</label>
            <div className="border p-2 rounded-md">{repairData.unresolved}</div>

            <label className="block text-sm font-medium">Các cột đã sửa chữa</label>
            <div className="border p-2 rounded-md">{repairData.powers}</div>
          </div>
        </>
      )}
    </div>
  );
}
