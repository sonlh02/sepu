"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
import {
  InspectData,
  ImageData,
  IncidentData,
  WarningData,
} from "../../doc_data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Copy, Trash, Maximize, Clipboard } from "lucide-react";

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
    id: string;
    name: string;
  }>;
  objects: Array<{
    id: string;
    name: string;
  }>;
};

export function NStep2({
  className,
  inspectData,
  images,
  setImages,
  warnings,
  setWarnings,
}: {
  className?: string;
  inspectData: InspectData;
  images: Array<File>;
  setImages: React.Dispatch<React.SetStateAction<Array<File>>>;
  warnings: Array<WarningData>;
  setWarnings: React.Dispatch<React.SetStateAction<Array<WarningData>>>;
}) {
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(
    null
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  function fetchReferenceData(inspectData: InspectData) {
    fetchWithToken(
      `${SE.API_WORKPOWER}?${new URLSearchParams({
        doc_id: String(inspectData.id),
        type: "inspect",
      })}`
    )
      .then((response) => response as ReferenceRawData)
      .then((data) => {
        if (!data.data) return;

        setReferenceData({
          powerPoles: Object.entries(data.data.powers).map(
            ([powerPolesId, powerPolesData]) => ({
              id: powerPolesId,
              name: powerPolesData.name,
            })
          ),
          objects: Object.entries(data.data.power_items).map(
            ([objectsId, objectsName]) => ({
              id: objectsId,
              name: objectsName,
            })
          ),
        });
      })
      .catch((e: Error) => {
        if (e.message) toast.error(e.message);
      });
  }

  useEffect(() => {
    fetchReferenceData(inspectData);
  }, [inspectData]);

  useEffect(() => {
    // Create image previews when images change
    const newPreviews = images.map((image) => URL.createObjectURL(image));
    setImagePreviews(newPreviews);

    // Cleanup function to revoke object URLs
    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [images]);

  function getWarningId(): number {
    while (true) {
      const warningId = Math.random();

      if (!warnings.some((warning) => warning.id === warningId))
        return warningId;
    }
  }

  return (
    <div className={`space-y-8 ${className || ""}`}>
      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh kiểm tra</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32 w-full">
            <div className="flex space-x-2 p-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="group relative aspect-square h-full shrink-0 overflow-hidden rounded bg-base-300"
                >
                  <Image
                    className="object-cover"
                    src={URL.createObjectURL(image)}
                    alt="upload"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100px", height: "100%" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.isSecureContext && navigator.clipboard) {
                          navigator.clipboard.writeText(images[index].name);
                          toast.info(
                            `Đã sao chép tên ảnh ${images[index].name}`
                          );
                        } else {
                          toast.warning(
                            `Chưa sao chép được tên ảnh (${images[index].name})`
                          );
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setImages((previousImages) =>
                          previousImages.filter((_, i) => i !== index)
                        );
                        setImagePreviews((previousPreviews) =>
                          previousPreviews.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Thêm ảnh</span>
              </div>
              <Input
                id="image-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={(event) => {
                  if (!event.target.files) return;
                  const files = Array.from(event.target.files);
                  setImages((previousImages) => [...previousImages, ...files]);
                  event.target.value = "";
                }}
              />
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cảnh báo / Bất thường</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warnings.map((warning, index) => (
              <Card key={warning.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cảnh báo #{index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const isWarning = warnings.filter(
                        (object) => object !== warning
                      );
                      setWarnings(
                        isWarning.length > 0
                          ? isWarning
                          : [
                              {
                                id: getWarningId(),
                                powerPole: undefined,
                                latitude: undefined,
                                longitude: undefined,
                                altitude: undefined,
                                image: undefined,
                                object: undefined,
                                description: undefined,
                              },
                            ]
                      );
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`power-pole-${warning.id}`}>Cột</Label>
                        <Select
                          onValueChange={(value) =>
                            setWarnings(
                              updateObjects(warnings, warning, {
                                powerPole: value,
                              })
                            )
                          }
                        >
                          <SelectTrigger id={`power-pole-${warning.id}`}>
                            <SelectValue placeholder="Chọn cột" />
                          </SelectTrigger>
                          <SelectContent>
                            {referenceData?.powerPoles.map((powerPole) => (
                              <SelectItem
                                key={powerPole.id}
                                value={powerPole.id}
                              >
                                {powerPole.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`object-${warning.id}`}>
                          Đối tượng
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setWarnings(
                              updateObjects(warnings, warning, {
                                object: value,
                              })
                            )
                          }
                        >
                          <SelectTrigger id={`object-${warning.id}`}>
                            <SelectValue placeholder="Chọn đối tượng" />
                          </SelectTrigger>
                          <SelectContent>
                            {referenceData?.objects.map((object) => (
                              <SelectItem key={object.id} value={object.id}>
                                {object.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`latitude-${warning.id}`}>Vĩ độ</Label>
                        <Input
                          id={`latitude-${warning.id}`}
                          type="number"
                          step="any"
                          onChange={(event) =>
                            setWarnings(
                              updateObjects(warnings, warning, {
                                latitude: event.target.value,
                              })
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`longitude-${warning.id}`}>
                          Kinh độ
                        </Label>
                        <Input
                          id={`longitude-${warning.id}`}
                          type="number"
                          step="any"
                          onChange={(event) =>
                            setWarnings(
                              updateObjects(warnings, warning, {
                                longitude: event.target.value,
                              })
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`altitude-${warning.id}`}>Cao độ</Label>
                        <Input
                          id={`altitude-${warning.id}`}
                          type="number"
                          step="any"
                          onChange={(event) =>
                            setWarnings(
                              updateObjects(warnings, warning, {
                                altitude: event.target.value,
                              })
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`image-${warning.id}`}>Ảnh</Label>
                      <div className="flex space-x-2">
                        <Input
                          id={`image-${warning.id}`}
                          value={warning.image}
                          onChange={(event) =>
                            setWarnings(
                              updateObjects(warnings, warning, {
                                image: event.target.value,
                              })
                            )
                          }
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            navigator.clipboard?.readText().then((text) =>
                              setWarnings(
                                updateObjects(warnings, warning, {
                                  image: text,
                                })
                              )
                            )
                          }
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${warning.id}`}>
                        Mô tả bất thường
                      </Label>
                      <Textarea
                        id={`description-${warning.id}`}
                        onChange={(event) =>
                          setWarnings(
                            updateObjects(warnings, warning, {
                              description: event.target.value,
                            })
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            className="mt-4"
            onClick={() =>
              setWarnings((previousWarnings) => [
                ...previousWarnings,
                {
                  id: getWarningId(),
                  powerPole: undefined,
                  latitude: undefined,
                  longitude: undefined,
                  altitude: undefined,
                  image: undefined,
                  object: undefined,
                  description: undefined,
                },
              ])
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm cảnh báo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function updateObjects(
  objects: Array<object>,
  atObject: object,
  changes: object
): Array<object> {
  return [
    ...objects.map((object) =>
      object === atObject ? { ...atObject, ...changes } : object
    ),
  ];
}

export function VStep2({
  className,
  inspectData,
  setImageData,
  setIncident,
  setAct,
  del,
}: {
  className?: string;
  inspectData: InspectData;
  setImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
  setIncident: React.Dispatch<React.SetStateAction<IncidentData | null>>;
  setAct: React.Dispatch<React.SetStateAction<string>>;
  del?: boolean;
}) {
  return (
    <div className={`space-y-8 ${className || ""}`}>
      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh kiểm tra</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full">
            <div className="flex space-x-2 p-2">
              {inspectData.images.map((image, index) => (
                <div
                  key={index}
                  className="group relative aspect-square h-64 shrink-0 overflow-hidden rounded-md"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${image.path}`}
                    alt="view"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white"
                      onClick={() => {
                        setAct("img-view");
                        setImageData({
                          id: image.id,
                          name: image.name,
                          path: image.path,
                        });
                      }}
                    >
                      <Maximize className="h-6 w-6" />
                    </Button>
                    {del && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => {
                          setAct("img-delete");
                          setImageData({
                            id: image.id,
                            name: image.name,
                            path: image.path,
                          });
                        }}
                      >
                        <Trash className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cảnh báo/ Bất thường</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inspectData.incidentFlies.map((incident, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-mono">
                    #{index + 1}
                  </CardTitle>
                  {del && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAct("incident-delete");
                        setIncident({
                          id: incident.id,
                          index: `#${index + 1}`,
                          path: incident.image,
                        });
                      }}
                    >
                      <Trash className="h-6 w-6 text-destructive" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-5">
                    <div className="relative aspect-square overflow-hidden rounded-md md:col-span-2 md:row-span-2">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${incident.image}`}
                        alt="view"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white"
                          onClick={() => {
                            setAct("img-incident");
                            setIncident({
                              id: incident.id,
                              index: `#${index + 1}`,
                              path: incident.image,
                            });
                          }}
                        >
                          <Maximize className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label>Cột</Label>
                      <div className="rounded-md border bg-muted px-3 py-2">
                        {incident.powerPole.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Vĩ độ</Label>
                      <div className="rounded-md border bg-muted px-3 py-2">
                        {incident.latitude}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Kinh độ</Label>
                      <div className="rounded-md border bg-muted px-3 py-2">
                        {incident.longitude}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cao độ</Label>
                      <div className="rounded-md border bg-muted px-3 py-2">
                        {incident.altitude}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-5">
                      <Label>Mô tả bất thường</Label>
                      <div className="rounded-md border bg-muted px-3 py-2">
                        {incident.description}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
